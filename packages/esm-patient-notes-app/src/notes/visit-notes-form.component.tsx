import React, { SyntheticEvent } from 'react';
import dayjs from 'dayjs';
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
} from 'carbon-components-react';
import {
  createErrorHandler,
  detach,
  showNotification,
  showToast,
  useConfig,
  useSessionUser,
} from '@openmrs/esm-framework';
import { convertToObsPayload, Diagnosis, VisitNotePayload } from './visit-note.util';
import { fetchDiagnosisByName, fetchLocationByUuid, fetchProviderByUuid, saveVisitNote } from './visit-notes.resource';
import { ConfigObject } from '../config-schema';
import styles from './visit-notes-form.scss';

const searchTimeoutInMs = 500;

interface Idle {
  type: ActionTypes.idle;
}

interface SearchAction {
  isSearching: boolean;
  searchResults?: Array<Diagnosis>;
  searchTerm: string;
  type: ActionTypes.search;
}

interface SelectDiagnoses {
  selectedDiagnoses: Array<Diagnosis>;
  type: ActionTypes.selectDiagnoses;
}

interface Submit {
  type: ActionTypes.submit;
}

type Action = Idle | SearchAction | SelectDiagnoses | Submit;

interface ViewState {
  status: string;
  isSearching?: boolean;
  searchResults?: Array<Diagnosis>;
  searchTerm?: string;
  selectedDiagnoses?: Array<Diagnosis>;
}

enum ActionTypes {
  idle = 'idle',
  search = 'search',
  selectDiagnoses = 'selectDiagnoses',
  submit = 'submitting',
}

function viewStateReducer(state: ViewState, action: Action): ViewState {
  switch (action.type) {
    case ActionTypes.idle:
      return {
        status: 'idle',
      };
    case ActionTypes.search:
      return {
        ...state,
        status: 'search',
        isSearching: action.isSearching,
        searchResults: action.searchResults,
        searchTerm: action.searchTerm,
      };
    case ActionTypes.selectDiagnoses:
      return {
        ...state,
        status: 'selectDiagnoses',
        selectedDiagnoses: action.selectedDiagnoses,
      };
    case ActionTypes.submit:
      return {
        ...state,
        status: 'submit',
      };
    default:
      return state;
  }
}

const initialViewState: ViewState = {
  status: 'idle',
};

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
  const [locationUuid, setLocationUuid] = React.useState<string | null>(null);
  const [providerUuid, setProviderUuid] = React.useState<string | null>(null);
  const [selectedDiagnoses, setSelectedDiagnoses] = React.useState<Array<Diagnosis>>([]);
  const [visitDateTime, setVisitDateTime] = React.useState(new Date());
  const [viewState, dispatch] = React.useReducer(viewStateReducer, initialViewState);

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
    const query = event.target.value.trim();
    if (query) {
      dispatch({
        isSearching: true,
        searchTerm: query,
        type: ActionTypes.search,
      });
      debouncedSearch(query);
    } else {
      dispatch({
        type: ActionTypes.idle,
      });
    }
  };

  const debouncedSearch = React.useMemo(
    () =>
      debounce((searchTerm) => {
        if (searchTerm) {
          const sub = fetchDiagnosisByName(searchTerm).subscribe(
            (matchingDiagnoses: Array<Diagnosis>) =>
              dispatch({
                isSearching: false,
                searchResults: matchingDiagnoses,
                searchTerm: searchTerm,
                type: ActionTypes.search,
              }),
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
    setSelectedDiagnoses((selectedDiagnoses) => [...selectedDiagnoses, diagnosisToAdd]);
    dispatch({
      selectedDiagnoses: selectedDiagnoses,
      type: ActionTypes.selectDiagnoses,
    });
  };

  const handleRemoveDiagnosis = (diagnosisToRemove: Diagnosis) => {
    setSelectedDiagnoses(
      selectedDiagnoses.filter((diagnosis) => diagnosis.concept.id !== diagnosisToRemove.concept.id),
    );
  };

  React.useMemo(() => {
    if (!selectedDiagnoses.length) {
      dispatch({
        type: ActionTypes.idle,
      });
    }
  }, [selectedDiagnoses]);

  const closeWorkspace = React.useCallback(
    () => detach('patient-chart-workspace-slot', 'visit-notes-form-workspace'),
    [],
  );

  const handleSubmit = React.useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (viewState.status !== ActionTypes.selectDiagnoses) return;

      const diagnoses = viewState.selectedDiagnoses;

      dispatch({
        type: ActionTypes.submit,
      });

      if (diagnoses.length) {
        diagnoses[0].primary = true;
      }

      let obs = convertToObsPayload(diagnoses);

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
          abortController.abort();
          dispatch({
            type: ActionTypes.idle,
          });
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
      t,
      viewState.selectedDiagnoses,
      viewState.status,
      visitDateTime,
    ],
  );

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
              light={isTablet}
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
                  switch (viewState.status) {
                    case ActionTypes.search:
                      return viewState.searchTerm;
                    default:
                      return '';
                  }
                })()}
              />
              <div>
                {(() => {
                  if (viewState.status !== ActionTypes.search) return null;
                  if (viewState.isSearching) return <SearchSkeleton />;
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
                  return (
                    <Tile light={isTablet} className={styles.emptyResults}>
                      <span>
                        {t('noMatchingDiagnoses', 'No diagnoses found matching')}{' '}
                        <strong>"{viewState.searchTerm}"</strong>
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
              light={isTablet}
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
              disabled={viewState.status !== ActionTypes.selectDiagnoses}
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
