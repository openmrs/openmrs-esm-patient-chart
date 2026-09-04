import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { debounce } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, type Control } from 'react-hook-form';
import type { TFunction } from 'i18next';
import {
  Button,
  ButtonSet,
  Column,
  Form,
  FormGroup,
  InlineLoading,
  InlineNotification,
  Row,
  Search,
  SkeletonText,
  Stack,
  TextArea,
  Tile,
} from '@carbon/react';
import { Add, CloseFilled, WarningFilled } from '@carbon/react/icons';
import {
  createAttachment,
  createErrorHandler,
  ExtensionSlot,
  OpenmrsDatePicker,
  ResponsiveWrapper,
  restBaseUrl,
  showModal,
  showSnackbar,
  useConfig,
  useFeatureFlag,
  useLayoutType,
  useSession,
  Workspace2,
  type Encounter,
  type UploadedFile,
  type Visit,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { invalidateVisitAndEncounterData, useAllowedFileExtensions } from '@openmrs/esm-patient-common-lib';
import type { ConfigObject } from '../config-schema';
import type { Concept, DiagnosisCertainty, DiagnosisPayload, VisitNotePayload } from '../types';
import {
  deletePatientDiagnosis,
  fetchDiagnosisConceptsByName,
  savePatientDiagnosis,
  saveVisitNote,
  updateVisitNote,
  useVisitNotes,
} from './visit-notes.resource';
import SelectedDiagnosisCard, {
  type DiagnosisDraft,
  isCompleteDiagnosis,
  nextDraftId,
} from './selected-diagnosis-card.component';
import styles from './visit-notes-form.scss';

type VisitNotesFormData = Omit<z.infer<ReturnType<typeof createSchema>>, 'images'> & {
  images?: UploadedFile[];
};

interface DiagnosesDisplayProps {
  isDiagnosisNotSelected: (diagnosis: Concept) => boolean;
  isLoading: boolean;
  isSearching: boolean;
  onAddDiagnosis: (diagnosis: Concept) => void;
  searchResults: Array<Concept>;
  t: TFunction;
  value: string;
}

interface DiagnosisSearchProps {
  control: Control<VisitNotesFormData>;
  error?: object;
  handleSearch: () => void;
  labelText: string;
  name: 'diagnosisSearch';
  placeholder: string;
  setIsSearching: (isSearching: boolean) => void;
}

const createSchema = (t: TFunction, isRetrospectiveDataEntryEnabled: boolean) => {
  return z.object({
    noteDate: isRetrospectiveDataEntryEnabled ? z.date() : z.date().optional(),
    diagnosisSearch: z.string().optional(),
    clinicalNote: z.string().optional(),
    images: z.array(z.any()).optional(),
  });
};

const SEARCH_TIMEOUT_MS = 500;

export interface VisitNotesFormProps {
  encounter?: Encounter;
  formContext: 'creating' | 'editing';
  patientUuid: string;
  patient: fhir.Patient;
  visitContext: Visit;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
}

/**
 * The form to record a patient's visit note. The caller supplies the patient and the visit the note
 * should be attached to, so this is agnostic of where it was launched from.
 */
const VisitNotesForm: React.FC<VisitNotesFormProps> = ({
  encounter,
  formContext,
  patientUuid,
  patient,
  visitContext,
  closeWorkspace,
}) => {
  const isEditing: boolean = Boolean(formContext === 'editing' && encounter?.id);
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const { isPrimaryDiagnosisRequired, ...config } = useConfig<ConfigObject>();
  const memoizedState = useMemo(() => ({ patientUuid, patient }), [patientUuid, patient]);
  const { clinicianEncounterRole, encounterNoteTextConceptUuid, encounterTypeUuid, formConceptUuid } =
    config.visitNoteConfig;
  const [isLoadingDiagnoses, setIsLoadingDiagnoses] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<Array<DiagnosisDraft>>([]);
  // Diagnosis edits live outside react-hook-form, so track them separately for unsaved-changes state.
  const [diagnosesTouched, setDiagnosesTouched] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<Concept>>(null);
  const [rows, setRows] = useState<number>();
  const [error, setError] = useState<Error>(null);
  const { allowedFileExtensions } = useAllowedFileExtensions();
  const isRetrospectiveDataEntryEnabled = useFeatureFlag('rde');

  const visitNoteFormSchema = useMemo(
    () => createSchema(t, isRetrospectiveDataEntryEnabled),
    [t, isRetrospectiveDataEntryEnabled],
  );

  const customResolver = useCallback(
    async (data, context, options) => {
      const zodResult = await zodResolver(visitNoteFormSchema)(data, context, options);

      // Both checks run in one pass so the user never fixes one only to be bounced by the
      // other on the next submit. The completeness error renders inside each incomplete
      // card; the primary-required error renders at the search box.
      const diagnosisErrors: Record<string, { type: string; message: string }> = {};
      if (selectedDiagnoses.some((diagnosis) => !isCompleteDiagnosis(diagnosis))) {
        diagnosisErrors.diagnoses = {
          type: 'custom',
          message: t('diagnosisOrderAndCertaintyRequired', 'Choose order and certainty for each diagnosis'),
        };
      }
      if (isPrimaryDiagnosisRequired && !selectedDiagnoses.some((diagnosis) => diagnosis.rank === 1)) {
        diagnosisErrors.diagnosisSearch = {
          type: 'custom',
          message: t('primaryDiagnosisRequired', 'Choose at least one primary diagnosis'),
        };
      }

      if (Object.keys(diagnosisErrors).length > 0) {
        return {
          ...zodResult,
          errors: {
            ...zodResult.errors,
            ...diagnosisErrors,
          },
        };
      }

      return zodResult;
    },
    [visitNoteFormSchema, isPrimaryDiagnosisRequired, selectedDiagnoses, t],
  );

  const {
    clearErrors,
    control,
    formState: { errors, dirtyFields, isSubmitted, isSubmitting },
    handleSubmit,
    setValue,
    watch,
  } = useForm<VisitNotesFormData>({
    mode: 'onSubmit',
    resolver: customResolver,
    defaultValues: {
      diagnosisSearch: '',
      noteDate: isEditing ? new Date(encounter.rawDatetime) : new Date(),
      clinicalNote: isEditing
        ? String(encounter?.obs?.find((obs) => obs.concept.uuid === encounterNoteTextConceptUuid)?.value || '')
        : '',
    },
  });

  useEffect(() => {
    if (encounter?.diagnoses?.length) {
      try {
        const transformedDiagnoses = encounter.diagnoses.map(
          (d): DiagnosisDraft => ({
            draftId: nextDraftId(),
            patient: patientUuid,
            diagnosis: d.diagnosis.coded?.uuid ? { coded: d.diagnosis.coded.uuid } : { nonCoded: d.diagnosis.nonCoded },
            // Values outside the known enums (possible from other REST writers) render as
            // unset so the clinician must choose explicitly rather than us guessing.
            certainty: d.certainty === 'CONFIRMED' || d.certainty === 'PROVISIONAL' ? d.certainty : undefined,
            rank: d.rank === 1 || d.rank === 2 ? d.rank : undefined,
            display: d.display,
          }),
        );

        setSelectedDiagnoses(transformedDiagnoses);
      } catch (err) {
        setError(new Error(t('errorTransformingDiagnoses', 'Error transforming diagnoses')));
        createErrorHandler();
      }
    }
  }, [encounter, patientUuid, t]);

  const currentImages = watch('images');

  const { mutateVisitNotes } = useVisitNotes(patientUuid);
  const { mutate: globalMutate } = useSWRConfig();

  const mutateAttachments = useCallback(
    () => globalMutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/attachment`)),
    [globalMutate],
  );

  const locationUuid = session?.sessionLocation?.uuid;
  const providerUuid = session?.currentProvider?.uuid;

  const debouncedSearch = useMemo(
    () =>
      debounce((fieldQuery) => {
        clearErrors('diagnosisSearch');
        if (fieldQuery) {
          setIsLoadingDiagnoses(true);

          fetchDiagnosisConceptsByName(fieldQuery, config.diagnosisConceptClass)
            .then((matchingConceptDiagnoses: Array<Concept>) => {
              setSearchResults(matchingConceptDiagnoses);
              setIsLoadingDiagnoses(false);
            })
            .catch((e) => {
              setError(e);
              createErrorHandler();
            });
        }
      }, SEARCH_TIMEOUT_MS),
    [config.diagnosisConceptClass, clearErrors],
  );

  const handleSearch = useCallback(() => {
    const fieldQuery = watch('diagnosisSearch');
    if (fieldQuery) {
      debouncedSearch(fieldQuery);
    }
    setIsSearching(false);
  }, [debouncedSearch, watch]);

  const createDiagnosis = useCallback(
    // Order and certainty deliberately start unset: the clinician must choose both on the
    // diagnosis card before the note can be saved (O3-5823).
    (concept: Concept): DiagnosisDraft => ({
      draftId: nextDraftId(),
      display: concept.display,
      diagnosis: {
        coded: concept.uuid,
      },
      patient: patientUuid,
    }),
    [patientUuid],
  );

  const handleAddDiagnosis = useCallback(
    (conceptDiagnosisToAdd: Concept) => {
      setValue('diagnosisSearch', '');
      setSearchResults([]);
      setSelectedDiagnoses((diagnoses) =>
        // Guards against a double-click on the same result racing the render-time filter
        diagnoses.some((diagnosis) => diagnosis.diagnosis.coded === conceptDiagnosisToAdd.uuid)
          ? diagnoses
          : [...diagnoses, createDiagnosis(conceptDiagnosisToAdd)],
      );
      setDiagnosesTouched(true);
      clearErrors('diagnosisSearch');
    },
    [createDiagnosis, setValue, clearErrors],
  );

  const handleRemoveDiagnosis = useCallback((diagnosisToRemove: DiagnosisDraft) => {
    setSelectedDiagnoses((diagnoses) =>
      diagnoses.filter((diagnosis) => diagnosis.draftId !== diagnosisToRemove.draftId),
    );
    setDiagnosesTouched(true);
    // The focused remove button unmounts with its card; return focus to the search input
    document.getElementById('diagnosisSearch')?.focus();
  }, []);

  const handleUpdateDiagnosis = useCallback(
    (diagnosisToUpdate: DiagnosisDraft, patch: Partial<Pick<DiagnosisDraft, 'rank' | 'certainty'>>) => {
      setSelectedDiagnoses((diagnoses) =>
        diagnoses.map((diagnosis) =>
          diagnosis.draftId === diagnosisToUpdate.draftId ? { ...diagnosis, ...patch } : diagnosis,
        ),
      );
      setDiagnosesTouched(true);
      if (patch.rank === 1) {
        clearErrors('diagnosisSearch');
      }
    },
    [clearErrors],
  );

  const isDiagnosisNotSelected = (diagnosis: Concept) =>
    !selectedDiagnoses.some((selectedDiagnosis) => diagnosis.uuid === selectedDiagnosis.diagnosis.coded);

  const showImageCaptureModal = useCallback(() => {
    const close = showModal('capture-photo-modal', {
      saveFile: (file: UploadedFile) => {
        if (file.capturedFromWebcam && !file.fileName.includes('.')) {
          file.fileName = `${file.fileName}.png`;
        }

        setValue('images', currentImages ? [...currentImages, file] : [file]);
        close();
        return Promise.resolve();
      },
      closeModal: () => {
        close();
      },
      allowedExtensions:
        allowedFileExtensions && Array.isArray(allowedFileExtensions)
          ? allowedFileExtensions.filter((ext) => !/pdf/i.test(ext))
          : [],
      collectDescription: true,
      multipleFiles: true,
    });
  }, [allowedFileExtensions, currentImages, setValue]);

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...currentImages];
    updatedImages.splice(index, 1);
    setValue('images', updatedImages);

    showSnackbar({
      title: t('imageRemoved', 'Image removed'),
      kind: 'success',
      isLowContrast: true,
    });
  };

  const onSubmit = useCallback(
    (data: VisitNotesFormData) => {
      const { noteDate, clinicalNote, images } = data;

      // The resolver blocks submission until every diagnosis has both order and certainty
      // chosen (and a primary exists when required); this guard is a type-narrowing backstop.
      const completedDiagnoses = selectedDiagnoses.filter(isCompleteDiagnosis);
      if (completedDiagnoses.length !== selectedDiagnoses.length) {
        return;
      }

      let finalNoteDate = dayjs(noteDate);
      const now = new Date();

      // When RDE is off, the datepicker is hidden and noteDate defaults to new Date().
      // This always falls within the 30-minute window, so encounterDatetime is intentionally
      // omitted from the payload -> letting the server attach the correct timestamp.
      if (finalNoteDate.diff(now, 'minute') <= 30) {
        finalNoteDate = null;
      }

      const existingClinicalNoteObs = encounter?.obs?.find((obs) => obs.concept.uuid === encounterNoteTextConceptUuid);

      const visitNotePayload: VisitNotePayload = {
        encounterDatetime: finalNoteDate?.format(),
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
          ? [
              {
                concept: { uuid: encounterNoteTextConceptUuid, display: '' },
                value: clinicalNote,
                ...(existingClinicalNoteObs && { uuid: existingClinicalNoteObs.uuid }),
              },
            ]
          : [],
        // Only attach the visit when creating a note. On edit, omitting `visit` leaves the encounter's
        // existing visit untouched rather than reassigning it to (or detaching it from) the active visit.
        ...(!isEditing && visitContext?.uuid && { visit: visitContext.uuid }),
      };

      const abortController = new AbortController();

      const savePromise = isEditing
        ? updateVisitNote(abortController, encounter.id, visitNotePayload)
        : saveVisitNote(abortController, visitNotePayload);

      return savePromise
        .then((response) => {
          if (response.status === 201 || response.status === 200) {
            const encounterUuid = encounter?.id || response.data.uuid;

            // If editing, first delete existing diagnoses
            if (isEditing && encounter?.diagnoses?.length) {
              return Promise.all(
                encounter.diagnoses.map((diagnosis) => deletePatientDiagnosis(abortController, diagnosis.uuid)),
              ).then(() => encounterUuid);
            }

            return encounterUuid;
          }
        })
        .then((encounterUuid) => {
          return Promise.all(
            completedDiagnoses.map((diagnosis) => {
              const diagnosesPayload: DiagnosisPayload = {
                encounter: encounterUuid,
                patient: patientUuid,
                condition: null,
                diagnosis: diagnosis.diagnosis,
                certainty: diagnosis.certainty,
                rank: diagnosis.rank,
              };
              return savePatientDiagnosis(abortController, diagnosesPayload);
            }),
          );
        })
        .then(() => {
          if (images?.length) {
            return Promise.all(
              images.map((image) => {
                const imageToUpload: UploadedFile = {
                  base64Content: image.base64Content,
                  file: image.file,
                  fileName: image.fileName,
                  fileType: image.fileType,
                  fileDescription: image.fileDescription || '',
                };
                return createAttachment(patientUuid, imageToUpload);
              }),
            );
          } else {
            return Promise.resolve([]);
          }
        })
        .then(() => {
          // Invalidate encounter and notes data since we created a new encounter with notes
          // Also invalidate visit history table since the visit now has new encounters
          invalidateVisitAndEncounterData(globalMutate, patientUuid);
          mutateVisitNotes();

          if (images?.length) {
            mutateAttachments();
          }

          closeWorkspace({ discardUnsavedChanges: true });

          showSnackbar({
            isLowContrast: true,
            subtitle: t('visitNoteNowVisible', 'It is now visible on the Visits page'),
            kind: 'success',
            title: t('visitNoteSaved', 'Visit note saved'),
          });
        })
        .catch((err) => {
          createErrorHandler();

          showSnackbar({
            title: t('visitNoteSaveError', 'Error saving visit note'),
            kind: 'error',
            isLowContrast: false,
            subtitle: err?.responseBody?.error?.message ?? err.message,
          });
        });
    },
    [
      visitContext?.uuid,
      clinicianEncounterRole,
      closeWorkspace,
      encounter?.diagnoses,
      encounter?.id,
      encounter?.obs,
      encounterNoteTextConceptUuid,
      encounterTypeUuid,
      formConceptUuid,
      globalMutate,
      isEditing,
      locationUuid,
      mutateAttachments,
      mutateVisitNotes,
      patientUuid,
      providerUuid,
      selectedDiagnoses,
      t,
    ],
  );

  const onError = (errors) => console.error(errors);

  const hasUserUnsavedChanges = Object.keys(dirtyFields).length > 0 || diagnosesTouched;

  return (
    <Workspace2 title={t('visitNoteWorkspaceTitle', 'Visit note')} hasUnsavedChanges={hasUserUnsavedChanges}>
      <Form className={styles.form} onSubmit={handleSubmit(onSubmit, onError)}>
        <ExtensionSlot name="visit-context-header-slot" state={{ patientUuid }} />

        {isTablet && (
          <Row className={styles.headerGridRow}>
            <ExtensionSlot name="visit-form-header-slot" className={styles.dataGridRow} state={memoizedState} />
          </Row>
        )}

        <div className={styles.formContainer}>
          <Stack gap={2}>
            {isTablet ? <h2 className={styles.heading}>{t('addVisitNote', 'Add a visit note')}</h2> : null}
            {isRetrospectiveDataEntryEnabled && (
              <Row className={styles.row}>
                <Column sm={1}>
                  <span className={styles.columnLabel}>{t('date', 'Date')}</span>
                </Column>
                <Column sm={3}>
                  <Controller
                    name="noteDate"
                    control={control}
                    render={({ field, fieldState }) => (
                      <ResponsiveWrapper>
                        <OpenmrsDatePicker
                          {...field}
                          data-testid="visitDateTimePicker"
                          id="visitDateTimePicker"
                          invalid={Boolean(fieldState?.error?.message)}
                          invalidText={fieldState?.error?.message}
                          isDisabled={isEditing}
                          labelText={t('visitDate', 'Visit date')}
                          maxDate={new Date()}
                        />
                      </ResponsiveWrapper>
                    )}
                  />
                </Column>
              </Row>
            )}
            <Row className={styles.row}>
              <Column sm={1}>
                <span className={styles.columnLabel}>{t('diagnosis', 'Diagnosis')}</span>
              </Column>
              <Column sm={3}>
                <FormGroup legendText={t('searchForDiagnosis', 'Search for a diagnosis to add')}>
                  <DiagnosisSearch
                    name="diagnosisSearch"
                    control={control}
                    labelText={t('searchForDiagnosis', 'Search for a diagnosis to add')}
                    placeholder={t('diagnosisInputPlaceholder', 'Choose a diagnosis')}
                    handleSearch={handleSearch}
                    error={errors?.diagnosisSearch}
                    setIsSearching={setIsSearching}
                  />
                  {error ? (
                    <InlineNotification
                      className={styles.errorNotification}
                      lowContrast
                      title={t('error', 'Error')}
                      subtitle={t('errorFetchingConcepts', 'There was a problem fetching concepts') + '.'}
                      onClose={() => setError(null)}
                    />
                  ) : null}
                  <DiagnosesDisplay
                    isDiagnosisNotSelected={isDiagnosisNotSelected}
                    isLoading={isLoadingDiagnoses}
                    isSearching={isSearching}
                    onAddDiagnosis={handleAddDiagnosis}
                    searchResults={searchResults}
                    t={t}
                    value={watch('diagnosisSearch')}
                  />
                  {selectedDiagnoses.length > 0 ? (
                    <>
                      <p className={styles.diagnosisHelperText}>
                        {t('diagnosisSearchHelperText', 'Choose order and certainty on each diagnosis selected.')}
                      </p>
                      <p className={styles.diagnosisCount}>
                        {t('diagnosisCountOnNote', '{{count}} diagnoses on this note', {
                          count: selectedDiagnoses.length,
                        })}
                      </p>
                      {selectedDiagnoses.map((diagnosis) => (
                        <SelectedDiagnosisCard
                          key={diagnosis.draftId}
                          diagnosis={diagnosis}
                          invalid={isSubmitted && !isCompleteDiagnosis(diagnosis)}
                          onRemove={handleRemoveDiagnosis}
                          onUpdate={handleUpdateDiagnosis}
                        />
                      ))}
                    </>
                  ) : (
                    <p className={styles.diagnosesText}>
                      {t('noDiagnosisSelectedText', 'No diagnosis selected — Enter a diagnosis above')}
                    </p>
                  )}
                </FormGroup>
              </Column>
            </Row>
            <Row className={styles.row}>
              <Column sm={1}>
                <span className={styles.columnLabel}>{t('note', 'Note')}</span>
              </Column>
              <Column sm={3}>
                <Controller
                  name="clinicalNote"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <ResponsiveWrapper>
                      <TextArea
                        id="additionalNote"
                        rows={rows}
                        labelText={t('clinicalNoteLabel', 'Write your notes')}
                        placeholder={t('clinicalNotePlaceholder', 'Write any notes here')}
                        value={value}
                        onBlur={onBlur}
                        onChange={(event) => {
                          onChange(event);
                          const textareaLineHeight = 24; // This is the default line height for Carbon's TextArea component
                          const newRows = Math.ceil(event.target.scrollHeight / textareaLineHeight);
                          setRows(newRows);
                        }}
                      />
                    </ResponsiveWrapper>
                  )}
                />
              </Column>
            </Row>
            <Row className={styles.row}>
              <Column sm={1}>
                <span className={styles.columnLabel}>{t('image', 'Image')}</span>
              </Column>
              <Column sm={3}>
                <FormGroup legendText="">
                  <p className={styles.imgUploadHelperText}>
                    {t('imageUploadHelperText', "Upload images or use this device's camera to capture images")}
                  </p>
                  <Button
                    className={styles.uploadButton}
                    kind={isTablet ? 'ghost' : 'tertiary'}
                    onClick={showImageCaptureModal}
                    renderIcon={(props) => <Add size={16} {...props} />}
                  >
                    {t('addImage', 'Add image')}
                  </Button>
                  <div className={styles.imgThumbnailGrid}>
                    {currentImages?.map((image, index) => (
                      <div key={index} className={styles.imgThumbnailItem}>
                        <div className={styles.imgThumbnailContainer}>
                          <img
                            className={styles.imgThumbnail}
                            src={image.base64Content}
                            alt={image.fileDescription ?? image.fileName}
                          />
                        </div>
                        <Button kind="ghost" className={styles.removeButton} onClick={() => handleRemoveImage(index)}>
                          <CloseFilled size={16} className={styles.closeIcon} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </FormGroup>
              </Column>
            </Row>
          </Stack>
        </div>
        <ButtonSet className={classnames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
          <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
            {t('discard', 'Discard')}
          </Button>
          <Button
            className={styles.button}
            kind="primary"
            disabled={!hasUserUnsavedChanges || isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <InlineLoading className={styles.spinner} description={t('saving', 'Saving') + '...'} />
            ) : (
              <span>{t('saveAndClose', 'Save and close')}</span>
            )}
          </Button>
        </ButtonSet>
      </Form>
    </Workspace2>
  );
};

function DiagnosisSearch({
  name,
  control,
  labelText,
  placeholder,
  handleSearch,
  error,
  setIsSearching,
}: DiagnosisSearchProps) {
  const isTablet = useLayoutType() === 'tablet';
  const inputRef = useRef(null);

  const searchInputFocus = () => {
    inputRef.current.focus();
  };

  useEffect(() => {
    if (error) {
      searchInputFocus();
    }
  }, [error]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, onBlur }, fieldState }) => (
        <>
          <ResponsiveWrapper>
            <Search
              ref={inputRef}
              size={isTablet ? 'lg' : 'md'}
              id={name}
              labelText={labelText}
              className={error && styles.diagnoserrorOutline}
              placeholder={placeholder}
              renderIcon={error && ((props) => <WarningFilled fill="red" {...props} />)}
              onChange={(e) => {
                setIsSearching(true);
                onChange(e);
                handleSearch();
              }}
              value={value}
              onBlur={onBlur}
            />
          </ResponsiveWrapper>
          {fieldState?.error?.message && <p className={styles.errorMessage}>{fieldState?.error?.message}</p>}
        </>
      )}
    />
  );
}

function DiagnosesDisplay({
  isDiagnosisNotSelected,
  isLoading,
  isSearching,
  onAddDiagnosis,
  searchResults,
  t,
  value,
}: DiagnosesDisplayProps) {
  if (!value) {
    return null;
  }

  if (isSearching || isLoading) {
    return <Loader />;
  }

  if (!isSearching && searchResults?.length > 0) {
    return (
      <ul className={styles.diagnosisList}>
        {searchResults.filter(isDiagnosisNotSelected).map((diagnosis) => (
          <li
            className={styles.diagnosis}
            key={diagnosis.uuid}
            onClick={() => onAddDiagnosis(diagnosis)}
            role="menuitem"
          >
            {diagnosis.display}
          </li>
        ))}
      </ul>
    );
  }

  if (searchResults?.length === 0) {
    return (
      <ResponsiveWrapper>
        <Tile className={styles.emptyResults}>
          <span>
            {t('noMatchingDiagnoses', 'No diagnoses found matching')} <strong>"{value}"</strong>
          </span>
        </Tile>
      </ResponsiveWrapper>
    );
  }
}

function Loader() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonText key={index} className={styles.skeleton} />
      ))}
    </>
  );
}

export default VisitNotesForm;
