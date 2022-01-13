import React, { SyntheticEvent } from 'react';
import dayjs from 'dayjs';
import { mutate } from 'swr';
import debounce from 'lodash-es/debounce';
import { useTranslation } from 'react-i18next';
import {
  Column,
  Grid,
  Row,
  Button,
  DatePicker,
  DatePickerInput,
  Form,
  FormGroup,
  Search,
  SearchSkeleton,
  Tag,
  TextArea,
  Tile,
  ButtonSet,
} from 'carbon-components-react';
import {
  createErrorHandler,
  detach,
  showNotification,
  showToast,
  useConfig,
  useSessionUser,
} from '@openmrs/esm-framework';
import { convertToObsPayload } from './visit-note.util';
import { fetchDiagnosisByName, fetchLocationByUuid, fetchProviderByUuid, saveVisitNote } from './visit-notes.resource';
import { ConfigObject } from '../config-schema';
import styles from './visit-notes-form.scss';
import { encountersCustomRepresentation } from './encounter.resource';
import { Diagnosis, VisitNotePayload } from '../types';

const searchTimeoutInMs = 500;

interface VisitNotesFormProps {
  patientUuid: string;
  isTablet: boolean;
}

const VisitNotesForm: React.FC<VisitNotesFormProps> = ({ patientUuid, isTablet }) => {
  const { t } = useTranslation();
  const session = useSessionUser();
  const config = useConfig() as ConfigObject;
  const { clinicianEncounterRole, encounterNoteConceptUuid, encounterTypeUuid, formConceptUuid } =
    config.visitNoteConfig;
  const [clinicalNote, setClinicalNote] = React.useState('');
  const [currentSessionProviderUuid, setCurrentSessionProviderUuid] = React.useState<string | null>('');
  const [currentSessionLocationUuid, setCurrentSessionLocationUuid] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [locationUuid, setLocationUuid] = React.useState<string | null>(null);
  const [providerUuid, setProviderUuid] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState<string | null>('');
  const [selectedDiagnoses, setSelectedDiagnoses] = React.useState<Array<Diagnosis>>([]);
  const [searchResults, setSearchResults] = React.useState<null | Array<Diagnosis>>(null);
  const [visitDateTime, setVisitDateTime] = React.useState(new Date());

  React.useEffect(() => {
    if (session && !currentSessionLocationUuid && !currentSessionProviderUuid) {
      setCurrentSessionLocationUuid(session?.sessionLocation?.uuid);
      setCurrentSessionProviderUuid(session?.currentProvider?.uuid);
    }
  }, [currentSessionLocationUuid, currentSessionProviderUuid, session]);

  React.useEffect(() => {
    const ac = new AbortController();
    if (currentSessionProviderUuid) {
      fetchProviderByUuid(ac, currentSessionProviderUuid).then(({ data }) => {
        setProviderUuid(data.uuid);
      });
    }
    if (currentSessionLocationUuid) {
      fetchLocationByUuid(ac, currentSessionLocationUuid).then(({ data }) => setLocationUuid(data.uuid));
    }
  }, [currentSessionLocationUuid, currentSessionProviderUuid]);

  const handleSearchChange = (event) => {
    setIsSearching(true);
    const query = event.target.value;
    setSearchTerm(query);
    if (query) {
      debouncedSearch(query);
    }
  };

  const debouncedSearch = React.useMemo(
    () =>
      debounce((searchTerm) => {
        if (searchTerm) {
          const sub = fetchDiagnosisByName(searchTerm).subscribe(
            (matchingDiagnoses: Array<Diagnosis>) => {
              setSearchResults(matchingDiagnoses);
              setIsSearching(false);
            },
            () => createErrorHandler(),
          );
          return () => {
            sub.unsubscribe();
          };
        }
      }, searchTimeoutInMs),
    [],
  );

  const handleAddDiagnosis = (diagnosisToAdd: Diagnosis) => {
    setSearchTerm('');
    setSearchResults(null);
    setSelectedDiagnoses((selectedDiagnoses) => [...selectedDiagnoses, diagnosisToAdd]);
  };

  const handleRemoveDiagnosis = (diagnosisToRemove: Diagnosis) => {
    setSelectedDiagnoses(
      selectedDiagnoses.filter((diagnosis) => diagnosis.concept.id !== diagnosisToRemove.concept.id),
    );
  };

  const closeWorkspace = React.useCallback(
    () => detach('patient-chart-workspace-slot', 'visit-notes-form-workspace'),
    [],
  );

  const handleSubmit = React.useCallback(
    (event: SyntheticEvent) => {
      event.preventDefault();

      if (!selectedDiagnoses.length) return;

      if (selectedDiagnoses.length) {
        selectedDiagnoses[0].primary = true;
      }

      let obs = convertToObsPayload(selectedDiagnoses);

      if (clinicalNote) {
        obs = [
          {
            concept: encounterNoteConceptUuid,
            value: clinicalNote,
          },
          ...obs,
        ];
      }

      let visitNotePayload: VisitNotePayload = {
        encounterDatetime: dayjs(visitDateTime).format(),
        patient: patientUuid,
        location: locationUuid,
        encounterProviders: [
          {
            encounterRole: clinicianEncounterRole,
            provider: providerUuid,
          },
        ],
        encounterType: encounterTypeUuid,
        form: formConceptUuid,
        obs: obs,
      };

      const abortController = new AbortController();
      saveVisitNote(abortController, visitNotePayload)
        .then((response) => {
          if (response.status === 201) {
            closeWorkspace();

            showToast({
              critical: true,
              description: t('visitNoteNowVisible', 'It is now visible on the Encounters page'),
              kind: 'success',
              title: t('visitNoteSaved', 'Visit note saved'),
            });

            mutate(`/ws/rest/v1/encounter?patient=${patientUuid}&v=${encountersCustomRepresentation}`);
          }
        })
        .catch((err) => {
          createErrorHandler();

          showNotification({
            title: t('visitNoteSaveError', 'Error saving visit note'),
            kind: 'error',
            critical: true,
            description: err?.message,
          });
        })
        .finally(() => {
          abortController.abort();
        });
    },
    [
      clinicalNote,
      clinicianEncounterRole,
      closeWorkspace,
      encounterNoteConceptUuid,
      encounterTypeUuid,
      formConceptUuid,
      locationUuid,
      patientUuid,
      providerUuid,
      selectedDiagnoses,
      t,
      visitDateTime,
    ],
  );

  return (
    <Form className={styles.form}>
      <Grid className={styles.grid}>
        {isTablet ? <h2 className={styles.heading}>{t('addVisitNote', 'Add a Visit Note')}</h2> : null}
        <Row className={styles.row}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('date', 'Date')}</span>
          </Column>
          <Column sm={3}>
            <DatePicker
              dateFormat="d/m/Y"
              datePickerType="single"
              light={isTablet}
              maxDate={new Date().toISOString()}
              value={visitDateTime}
              onChange={([date]) => setVisitDateTime(date)}
            >
              <DatePickerInput
                id="visitDateTimePicker"
                labelText={t('visitDate', 'Visit date')}
                placeholder="dd/mm/yyyy"
              />
            </DatePicker>
          </Column>
        </Row>
        <Row className={styles.row}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('diagnosis', 'Diagnosis')}</span>
          </Column>
          <Column sm={3}>
            <div className={styles.diagnosesText} style={{ marginBottom: '1.188rem' }}>
              {selectedDiagnoses && selectedDiagnoses.length ? (
                <>
                  {selectedDiagnoses.map((diagnosis, index) => (
                    <Tag
                      filter
                      key={index}
                      onClose={() => handleRemoveDiagnosis(diagnosis)}
                      style={{ marginRight: '0.5rem' }}
                      type={index === 0 ? 'red' : 'blue'}
                    >
                      {diagnosis.concept.preferredName}
                    </Tag>
                  ))}
                </>
              ) : (
                <span>{t('emptyDiagnosisText', 'No diagnosis selected — Enter a diagnosis below')}</span>
              )}
            </div>
            <FormGroup legendText={t('searchForDiagnosis', 'Search for a diagnosis')}>
              <Search
                light={isTablet}
                size="xl"
                id="diagnosisSearch"
                labelText={t('enterDiagnoses', 'Enter diagnoses')}
                placeholder={t(
                  'diagnosisInputPlaceholder',
                  'Choose a primary diagnosis first, then secondary diagnoses',
                )}
                onChange={handleSearchChange}
                value={(() => {
                  if (searchTerm) {
                    return searchTerm;
                  }
                  return '';
                })()}
              />
              <div>
                {(() => {
                  if (!searchTerm) return null;
                  if (isSearching) return <SearchSkeleton />;
                  if (searchResults && searchResults.length && !isSearching)
                    return (
                      <ul className={styles.diagnosisList}>
                        {searchResults.map((diagnosis, index) => (
                          <li
                            role="menuitem"
                            className={styles.diagnosis}
                            key={index}
                            onClick={() => handleAddDiagnosis(diagnosis)}
                          >
                            {diagnosis.concept.preferredName}
                          </li>
                        ))}
                      </ul>
                    );
                  return (
                    <Tile light={isTablet} className={styles.emptyResults}>
                      <span>
                        {t('noMatchingDiagnoses', 'No diagnoses found matching')} <strong>"{searchTerm}"</strong>
                      </span>
                    </Tile>
                  );
                })()}
              </div>
            </FormGroup>
          </Column>
        </Row>
        <Row className={styles.row}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('note', 'Note')}</span>
          </Column>
          <Column sm={3}>
            <TextArea
              id="additionalNote"
              light={isTablet}
              labelText={t('clinicalNoteLabel', 'Write an additional note')}
              placeholder={t('clinicalNotePlaceholder', 'Write any additional points here')}
              onChange={(event) => setClinicalNote(event.currentTarget.value)}
            />
          </Column>
        </Row>
        <Row className={styles.row}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('image', 'Image')}</span>
          </Column>
          <Column sm={3}>
            <FormGroup legendText={t('addImageToVisit', 'Add an image to this visit')}>
              <p className={styles.imgUploadHelperText}>
                {t('imageUploadHelperText', "Upload an image or use this device's camera to capture an image")}
              </p>
              <Button style={{ marginTop: '1rem' }} kind="tertiary" onClick={() => {}}>
                {t('addImage', 'Add image')}
              </Button>
            </FormGroup>
          </Column>
        </Row>
      </Grid>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button
          className={styles.button}
          kind="primary"
          onClick={handleSubmit}
          disabled={!selectedDiagnoses.length}
          type="submit"
        >
          {t('saveAndClose', 'Save and close')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default VisitNotesForm;
