import React, { SyntheticEvent } from 'react';
import dayjs from 'dayjs';
import { useSWRConfig } from 'swr';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
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
import Add16 from '@carbon/icons-react/es/add/16';
import {
  createErrorHandler,
  showNotification,
  showToast,
  useConfig,
  useLayoutType,
  useSession,
} from '@openmrs/esm-framework';
import {
  fetchConceptDiagnosisByName,
  fetchLocationByUuid,
  fetchProviderByUuid,
  savePatientDiagnoses,
  saveVisitNote,
} from './visit-notes.resource';
import { ConfigObject } from '../config-schema';
import { Concept, Diagnosis, DiagnosisPayload, VisitNotePayload } from '../types';
import { DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import styles from './visit-notes-form.scss';

const searchTimeoutInMs = 500;
const encountersCustomRepresentation =
  'custom:(uuid,display,encounterDatetime,' +
  'location:(uuid,display,name),' +
  'encounterType:(name,uuid),' +
  'auditInfo:(creator:(display),changedBy:(display)),' +
  'encounterProviders:(provider:(person:(display))))';

const VisitNotesForm: React.FC<DefaultWorkspaceProps> = ({ closeWorkspace, patientUuid }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const { mutate } = useSWRConfig();
  const config = useConfig() as ConfigObject;
  const { clinicianEncounterRole, encounterNoteTextConceptUuid, encounterTypeUuid, formConceptUuid } =
    config.visitNoteConfig;
  const [clinicalNote, setClinicalNote] = React.useState('');
  const [currentSessionProviderUuid, setCurrentSessionProviderUuid] = React.useState<string | null>('');
  const [currentSessionLocationUuid, setCurrentSessionLocationUuid] = React.useState('');
  const [isPrimarySearching, setIsPrimarySearching] = React.useState(false);
  const [isSecondarySearching, setIsSecondarySearching] = React.useState(false);
  const [isHandlingSubmit, setIsHandlingSubmit] = React.useState(false);
  const [locationUuid, setLocationUuid] = React.useState<string | null>(null);
  const [providerUuid, setProviderUuid] = React.useState<string | null>(null);
  const [primarySearchTerm, setPrimarySearchTerm] = React.useState<string | null>('');
  const [secondarySearchTerm, setSecondarySearchTerm] = React.useState<string | null>('');
  const [selectedPrimaryDiagnoses, setSelectedPrimaryDiagnoses] = React.useState<Array<Diagnosis>>([]);
  const [selectedSecondaryDiagnoses, setSelectedSecondaryDiagnoses] = React.useState<Array<Diagnosis>>([]);
  const [searchPrimaryResults, setSearchPrimaryResults] = React.useState<null | Array<Concept>>(null);
  const [searchSecondaryResults, setSearchSecondaryResults] = React.useState<null | Array<Concept>>(null);
  const [combinedDiagnoses, setCombinedDiagnoses] = React.useState<Array<Diagnosis>>([]);
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

  const handlePrimarySearchChange = (event) => {
    setIsPrimarySearching(true);
    const query = event.target.value;
    setPrimarySearchTerm(query);
    if (query) {
      debouncedSearch(query, 'primaryInputSearch');
    }
  };

  const handleSecondarySearchChange = (event) => {
    setIsSecondarySearching(true);
    const query = event.target.value;
    setSecondarySearchTerm(query);
    if (query) {
      debouncedSearch(query, 'secondaryInputSearch');
    }
  };

  const debouncedSearch = React.useMemo(
    () =>
      debounce((searchTerm, searchInputField) => {
        if (searchTerm) {
          const sub = fetchConceptDiagnosisByName(searchTerm).subscribe(
            (matchingConceptDiagnoses: Array<Concept>) => {
              if (searchInputField == 'primaryInputSearch') {
                setSearchPrimaryResults(matchingConceptDiagnoses);
                setIsPrimarySearching(false);
              } else if (searchInputField == 'secondaryInputSearch') {
                setSearchSecondaryResults(matchingConceptDiagnoses);
                setIsSecondarySearching(false);
              }
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

  const handleAddDiagnosis = (conceptDiagnosisToAdd: Concept, searchInputField: string) => {
    let newDiagnosis = createDiagnosis(conceptDiagnosisToAdd);
    if (searchInputField == 'primaryInputSearch') {
      newDiagnosis.rank = 1;
      setPrimarySearchTerm('');
      setSearchPrimaryResults(null);
      setSelectedPrimaryDiagnoses((selectedDiagnoses) => [...selectedDiagnoses, newDiagnosis]);
    } else if (searchInputField == 'secondaryInputSearch') {
      setSecondarySearchTerm('');
      setSearchSecondaryResults(null);
      setSelectedSecondaryDiagnoses((selectedDiagnoses) => [...selectedDiagnoses, newDiagnosis]);
    }
    setCombinedDiagnoses((diagnosisCombined) => [...diagnosisCombined, newDiagnosis]);
  };

  const handleRemoveDiagnosis = (diagnosisToRemove: Diagnosis, searchInputField: string) => {
    if (searchInputField == 'primaryInputSearch') {
      setSelectedPrimaryDiagnoses(
        selectedPrimaryDiagnoses.filter((diagnosis) => diagnosis.diagnosis.coded !== diagnosisToRemove.diagnosis.coded),
      );
    } else if (searchInputField == 'secondaryInputSearch') {
      setSelectedSecondaryDiagnoses(
        selectedSecondaryDiagnoses.filter(
          (diagnosis) => diagnosis.diagnosis.coded !== diagnosisToRemove.diagnosis.coded,
        ),
      );
    }
    setCombinedDiagnoses(
      combinedDiagnoses.filter((diagnosis) => diagnosis.diagnosis.coded !== diagnosisToRemove.diagnosis.coded),
    );
  };

  const createDiagnosis = (concept: Concept) => {
    return {
      patient: patientUuid,
      diagnosis: {
        coded: concept.uuid,
      },
      rank: 2,
      certainty: 'PROVISIONAL',
      display: concept.display,
    };
  };

  const handleSubmit = React.useCallback(
    (event: SyntheticEvent) => {
      setIsHandlingSubmit(true);
      event.preventDefault();

      if (!selectedPrimaryDiagnoses.length) {
        setIsHandlingSubmit(false);
        return;
      }

      let visitNotePayload: VisitNotePayload = {
        encounterDatetime: dayjs(visitDateTime).format(),
        form: formConceptUuid,
        patient: patientUuid,
        location: locationUuid,
        encounterProviders: [
          {
            encounterRole: clinicianEncounterRole,
            provider: providerUuid,
          },
        ],
        encounterType: encounterTypeUuid,
        obs: clinicalNote
          ? [{ concept: { uuid: encounterNoteTextConceptUuid, display: '' }, value: clinicalNote }]
          : [],
      };

      const abortController = new AbortController();
      saveVisitNote(abortController, visitNotePayload)
        .then((response) => {
          if (response.status === 201) {
            combinedDiagnoses.map((diagnosis, position: number) => {
              let diagnosisPayload: DiagnosisPayload = {
                encounter: response.data.uuid,
                patient: patientUuid,
                condition: null,
                diagnosis: {
                  coded: diagnosis.diagnosis.coded,
                },
                certainty: diagnosis.certainty,
                rank: diagnosis.rank,
              };
              savePatientDiagnoses(abortController, diagnosisPayload);
            });
          }
        })
        .then(() => {
          closeWorkspace();
          showToast({
            critical: true,
            description: t('visitNoteNowVisible', 'It is now visible on the Encounters     page'),
            kind: 'success',
            title: t('visitNoteSaved', 'Visit note saved'),
          });
          mutate(`/ws/rest/v1/encounter?patient=${patientUuid}&v=${encountersCustomRepresentation}`);
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
          setIsHandlingSubmit(false);
          abortController.abort();
        });
    },
    [
      clinicalNote,
      clinicianEncounterRole,
      closeWorkspace,
      encounterNoteTextConceptUuid,
      encounterTypeUuid,
      formConceptUuid,
      locationUuid,
      mutate,
      patientUuid,
      providerUuid,
      combinedDiagnoses,
      t,
      visitDateTime,
    ],
  );

  return (
    <Form className={styles.form}>
      <Grid className={styles.grid}>
        {isTablet ? <h2 className={styles.heading}>{t('addVisitNote', 'Add a visit note')}</h2> : null}
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
              {selectedPrimaryDiagnoses && selectedPrimaryDiagnoses.length ? (
                <>
                  {selectedPrimaryDiagnoses.map((diagnosis, index) => (
                    <Tag
                      filter
                      key={index}
                      onClose={() => handleRemoveDiagnosis(diagnosis, 'primaryInputSearch')}
                      style={{ marginRight: '0.5rem' }}
                      type={'red'}
                    >
                      {diagnosis.display}
                    </Tag>
                  ))}
                </>
              ) : (
                <></>
              )}
              {selectedSecondaryDiagnoses && selectedSecondaryDiagnoses.length ? (
                <>
                  {selectedSecondaryDiagnoses.map((diagnosis, index) => (
                    <Tag
                      filter
                      key={index}
                      onClose={() => handleRemoveDiagnosis(diagnosis, 'secondaryInputSearch')}
                      style={{ marginRight: '0.5rem' }}
                      type={'blue'}
                    >
                      {diagnosis.display}
                    </Tag>
                  ))}
                </>
              ) : (
                <></>
              )}
              {selectedPrimaryDiagnoses &&
              !selectedPrimaryDiagnoses.length &&
              selectedSecondaryDiagnoses &&
              !selectedSecondaryDiagnoses.length ? (
                <span>{t('emptyDiagnosisText', 'No diagnosis selected — Enter a diagnosis below')}</span>
              ) : (
                <></>
              )}
            </div>
            <FormGroup legendText={t('searchForPrimaryDiagnosis', 'Search for a primary diagnosis')}>
              <Search
                light={isTablet}
                size="xl"
                id="diagnosisPrimarySearch"
                labelText={t('enterPrimaryDiagnoses', 'Enter Primary diagnosis')}
                placeholder={t('primaryDiagnosisInputPlaceholder', 'Choose a primary diagnosis')}
                onChange={handlePrimarySearchChange}
                value={(() => {
                  if (primarySearchTerm) {
                    return primarySearchTerm;
                  }
                  return '';
                })()}
              />
              <div>
                {(() => {
                  if (!primarySearchTerm) return null;
                  if (isPrimarySearching) return <SearchSkeleton />;
                  if (searchPrimaryResults && searchPrimaryResults.length && !isPrimarySearching)
                    return (
                      <ul className={styles.diagnosisList}>
                        {searchPrimaryResults.map((diagnosis, index) => (
                          <li
                            role="menuitem"
                            className={styles.diagnosis}
                            key={index}
                            onClick={() => handleAddDiagnosis(diagnosis, 'primaryInputSearch')}
                          >
                            {diagnosis.display}
                          </li>
                        ))}
                      </ul>
                    );
                  return (
                    <Tile light={isTablet} className={styles.emptyResults}>
                      <span>
                        {t('noMatchingDiagnoses', 'No diagnoses found matching')} <strong>"{primarySearchTerm}"</strong>
                      </span>
                    </Tile>
                  );
                })()}
              </div>
            </FormGroup>
          </Column>
        </Row>
        <Row className={styles.row}>
          <Column sm={1}></Column>
          <Column sm={3}>
            <FormGroup legendText={t('searchForSecondaryDiagnosis', 'Search for a secondary diagnosis')}>
              <Search
                light={isTablet}
                size="xl"
                id="diagnosisSecondarySearch"
                labelText={t('enterSecondaryDiagnoses', 'Enter Secondary diagnosis')}
                placeholder={t('secondaryDiagnosisInputPlaceholder', 'Choose a secondary diagnose')}
                onChange={handleSecondarySearchChange}
                value={(() => {
                  if (secondarySearchTerm) {
                    return secondarySearchTerm;
                  }
                  return '';
                })()}
              />
              <div>
                {(() => {
                  if (!secondarySearchTerm) return null;
                  if (isSecondarySearching) return <SearchSkeleton />;
                  if (searchSecondaryResults && searchSecondaryResults.length && !isSecondarySearching)
                    return (
                      <ul className={styles.diagnosisList}>
                        {searchSecondaryResults.map((diagnosis, index) => (
                          <li
                            role="menuitem"
                            className={styles.diagnosis}
                            key={index}
                            onClick={() => handleAddDiagnosis(diagnosis, 'secondaryInputSearch')}
                          >
                            {diagnosis.display}
                          </li>
                        ))}
                      </ul>
                    );
                  return (
                    <Tile light={isTablet} className={styles.emptyResults}>
                      <span>
                        {t('noMatchingDiagnoses', 'No diagnoses found matching')}{' '}
                        <strong>"{secondarySearchTerm}"</strong>
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
              <Button style={{ marginTop: '1rem' }} kind="tertiary" onClick={() => {}} renderIcon={Add16}>
                {t('addImage', 'Add image')}
              </Button>
            </FormGroup>
          </Column>
        </Row>
      </Grid>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
          {t('discard', 'Discard')}
        </Button>
        <Button
          className={styles.button}
          kind="primary"
          onClick={handleSubmit}
          disabled={!selectedPrimaryDiagnoses.length || isHandlingSubmit}
          type="submit"
        >
          {t('saveAndClose', 'Save and close')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default VisitNotesForm;
