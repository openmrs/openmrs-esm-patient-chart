import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import debounce from 'lodash-es/debounce';
import styles from './visit-notes-form.scss';
import Button from 'carbon-components-react/es/components/Button';
import DatePicker from 'carbon-components-react/es/components/DatePicker';
import DatePickerInput from 'carbon-components-react/es/components/DatePickerInput';
import Form from 'carbon-components-react/es/components/Form';
import FormGroup from 'carbon-components-react/es/components/FormGroup';
import Search from 'carbon-components-react/es/components/Search';
import SearchSkeleton from 'carbon-components-react/es/components/Search/Search.Skeleton';
import Tag from 'carbon-components-react/es/components/Tag';
import TextArea from 'carbon-components-react/es/components/TextArea';
import { Tile } from 'carbon-components-react/es/components/Tile';
import { useTranslation } from 'react-i18next';
import { Column, Grid, Row } from 'carbon-components-react/es/components/Grid';
import {
  createErrorHandler,
  showNotification,
  showToast,
  useConfig,
  useLayoutType,
  useSessionUser,
} from '@openmrs/esm-framework';
import { convertToObsPayLoad, Diagnosis, VisitNotePayload } from './visit-note.util';
import { fetchDiagnosisByName, fetchLocationByUuid, fetchProviderByUuid, saveVisitNote } from './visit-notes.resource';
import { ConfigObject } from '../config-schema';
const searchTimeoutInMs = 300;

enum StateTypes {
  IDLE,
  SEARCH,
  DIAGNOSES,
  SUBMIT,
}

interface VisitNotesFormProps {
  closeWorkspace(): void;
  patientUuid: string;
}

interface IdleState {
  type: StateTypes.IDLE;
}

interface SearchState {
  isSearching: boolean;
  searchResults?: Array<Diagnosis>;
  searchTerm: string;
  type: StateTypes.SEARCH;
}

interface DiagnosesState {
  selectedDiagnoses: Array<Diagnosis>;
  type: StateTypes.DIAGNOSES;
}

interface SubmitState {
  type: StateTypes.SUBMIT;
}

type ViewState = IdleState | SearchState | DiagnosesState | SubmitState;

const VisitNotesForm: React.FC<VisitNotesFormProps> = ({ patientUuid, closeWorkspace }) => {
  const { t } = useTranslation();
  const session = useSessionUser();
  const config = useConfig() as ConfigObject;
  const layout = useLayoutType();
  const { clinicianEncounterRole, encounterNoteConceptUuid, encounterTypeUuid, formConceptUuid } =
    config.visitNoteConfig;
  const [clinicalNote, setClinicalNote] = React.useState('');
  const [currentSessionProviderUuid, setCurrentSessionProviderUuid] = React.useState<string | null>('');
  const [currentSessionLocationUuid, setCurrentSessionLocationUuid] = React.useState('');
  const [locationUuid, setLocationUuid] = React.useState<string | null>(null);
  const [providerUuid, setProviderUuid] = React.useState<string | null>(null);
  const [selectedDiagnoses, setSelectedDiagnoses] = React.useState<Array<Diagnosis>>([]);
  const [visitDateTime, setVisitDateTime] = React.useState(new Date());
  const [viewState, setViewState] = React.useState<ViewState>({
    type: StateTypes.IDLE,
  });
  const [lightMode, setLightMode] = useState<boolean>();

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

  useEffect(() => {
    layout === 'desktop' ? setLightMode(false) : setLightMode(true);
  }, [layout]);

  const debouncedSearch = React.useMemo(
    () =>
      debounce((searchTerm) => {
        if (searchTerm) {
          const sub = fetchDiagnosisByName(searchTerm).subscribe(
            (diagnoses: Array<Diagnosis>) => setViewState((state) => ({ ...state, searchResults: diagnoses })),
            createErrorHandler(),
            () => {
              setViewState((state) => ({ ...state, isSearching: false }));
              sub.unsubscribe();
            },
          );
        } else {
          setViewState((state) => ({ ...state, searchResults: null }));
        }
      }, searchTimeoutInMs),
    [],
  );

  const searchTerm = (viewState as SearchState).searchTerm;
  React.useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleAddDiagnosis = (diagnosisToAdd: Diagnosis) => {
    setSelectedDiagnoses((selectedDiagnoses) => [...selectedDiagnoses, diagnosisToAdd]);
    setViewState({
      type: StateTypes.DIAGNOSES,
      selectedDiagnoses: selectedDiagnoses,
    });
  };

  const handleRemoveDiagnosis = (diagnosisToRemove: Diagnosis) => {
    setSelectedDiagnoses(
      selectedDiagnoses.filter((diagnosis) => diagnosis.concept.id !== diagnosisToRemove.concept.id),
    );
  };

  React.useMemo(() => {
    if (!selectedDiagnoses.length) {
      setViewState({
        type: StateTypes.IDLE,
      });
    }
  }, [selectedDiagnoses]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (viewState.type !== StateTypes.DIAGNOSES) return;

    if (selectedDiagnoses.length) {
      selectedDiagnoses[0].primary = true;
    }

    let obs = convertToObsPayLoad(selectedDiagnoses);

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

    const ac = new AbortController();
    saveVisitNote(ac, visitNotePayload)
      .then((response) => {
        if (response.status === 201) {
          closeWorkspace();

          showToast({
            kind: 'success',
            description: t('visitNoteSaved', 'Visit note saved successfully'),
          });
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
        ac.abort();
        setViewState({ type: StateTypes.IDLE });
      });
  };

  return (
    <Form className={styles.visitNoteForm}>
      <h2 className={styles.heading}>{t('addVisitNote', 'Add a Visit Note')}</h2>
      <Grid style={{ margin: 0, padding: '0 1rem' }}>
        <Row style={{ marginTop: '0.5rem', marginBottom: '2.75rem' }}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('date', 'Date')}</span>
          </Column>
          <Column sm={3}>
            <DatePicker
              dateFormat="d/m/Y"
              datePickerType="single"
              light={lightMode}
              maxDate={new Date().toISOString()}
              value={visitDateTime}
              onChange={([date]) => setVisitDateTime(date)}>
              <DatePickerInput
                id="visitDateTimePicker"
                labelText={t('visitDate', 'Visit date')}
                placeholder="dd/mm/yyyy"
              />
            </DatePicker>
          </Column>
        </Row>
        <Row style={{ marginTop: '0.5rem', marginBottom: '2.75rem' }}>
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
                      type={index === 0 ? 'red' : 'blue'}>
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
                light={lightMode}
                size="xl"
                id="diagnosisSearch"
                labelText={t('enterDiagnoses', 'Enter diagnoses')}
                placeholder={t(
                  'diagnosisInputPlaceholder',
                  'Choose a primary diagnosis first, then secondary diagnoses',
                )}
                onChange={(event) => {
                  setViewState(
                    event.target.value
                      ? {
                          isSearching: true,
                          searchTerm: event.target.value,
                          type: StateTypes.SEARCH,
                        }
                      : { type: StateTypes.IDLE },
                  );
                }}
                value={(() => {
                  switch (viewState.type) {
                    case StateTypes.SEARCH:
                      return viewState.searchTerm;
                    default:
                      return '';
                  }
                })()}
              />
              <div>
                {(() => {
                  if (viewState.type !== StateTypes.SEARCH) return null;
                  if (viewState.searchResults && viewState.searchResults.length)
                    return (
                      <ul className={styles.diagnosisList}>
                        {viewState.searchResults.map((diagnosis, index) => (
                          <li
                            role="menuitem"
                            className={styles.diagnosis}
                            key={index}
                            onClick={() => handleAddDiagnosis(diagnosis)}>
                            {diagnosis.concept.preferredName}
                          </li>
                        ))}
                      </ul>
                    );
                  if (viewState.isSearching) return <SearchSkeleton />;
                  return (
                    <Tile light={lightMode} className={styles.emptyResults}>
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
        <Row style={{ marginTop: '0.5rem', marginBottom: '2.75rem' }}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('note', 'Note')}</span>
          </Column>
          <Column sm={3}>
            <TextArea
              id="additionalNote"
              light={lightMode}
              labelText={t('clinicalNoteLabel', 'Write an additional note')}
              placeholder={t('clinicalNotePlaceholder', 'Write any additional points here')}
              onChange={(event) => setClinicalNote(event.currentTarget.value)}
            />
          </Column>
        </Row>
        <Row style={{ marginTop: '0.5rem', marginBottom: '2.75rem' }}>
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
        <Row>
          <Column>
            <Button kind="secondary" onClick={closeWorkspace} style={{ width: '50%' }}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              kind="primary"
              onClick={handleSubmit}
              style={{ width: '50%' }}
              disabled={viewState.type !== StateTypes.DIAGNOSES}
              type="submit">
              {t('saveAndClose', 'Save & Close')}
            </Button>
          </Column>
        </Row>
      </Grid>
    </Form>
  );
};

export default VisitNotesForm;
