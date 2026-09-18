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
  Tag,
  TextArea,
  Tile,
} from '@carbon/react';
import { Add, Close, WarningFilled } from '@carbon/react/icons';
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
import type { Concept, Diagnosis, DiagnosisPayload, VisitNotePayload } from '../types';
import {
  deletePatientDiagnosis,
  fetchDiagnosisConceptsByName,
  removeVisitNoteImage,
  savePatientDiagnosis,
  saveVisitNote,
  updateVisitNote,
  useVisitNoteImages,
  useVisitNotes,
} from './visit-notes.resource';
import styles from './visit-notes-form.scss';

type VisitNotesFormData = Omit<z.infer<ReturnType<typeof createSchema>>, 'images'> & {
  images?: UploadedFile[];
};

interface DiagnosesDisplayProps {
  fieldName: string;
  isDiagnosisNotSelected: (diagnosis: Concept) => boolean;
  isLoading: boolean;
  isSearching: boolean;
  onAddDiagnosis: (diagnosis: Concept, searchInputField: string) => void;
  searchResults: Array<Concept>;
  t: TFunction;
  value: string;
}

interface DiagnosisSearchProps {
  control: Control<VisitNotesFormData>;
  error?: object;
  handleSearch: (fieldName) => void;
  labelText: string;
  name: 'noteDate' | 'primaryDiagnosisSearch' | 'secondaryDiagnosisSearch' | 'clinicalNote';
  placeholder: string;
  setIsSearching: (isSearching: boolean) => void;
}

const createSchema = (t: TFunction, isRetrospectiveDataEntryEnabled: boolean) => {
  return z.object({
    noteDate: isRetrospectiveDataEntryEnabled ? z.date() : z.date().optional(),
    primaryDiagnosisSearch: z.string(),
    secondaryDiagnosisSearch: z.string().optional(),
    clinicalNote: z.string().optional(),
    images: z.array(z.any()).optional(),
    removedImageIds: z.array(z.string()),
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
  const visitContextHeaderState = useMemo(() => ({ patientUuid }), [patientUuid]);
  const memoizedState = useMemo(() => ({ patientUuid, patient }), [patientUuid, patient]);
  const { clinicianEncounterRole, encounterNoteTextConceptUuid, encounterTypeUuid, formConceptUuid } =
    config.visitNoteConfig;
  const [isLoadingPrimaryDiagnoses, setIsLoadingPrimaryDiagnoses] = useState(false);
  const [isLoadingSecondaryDiagnoses, setIsLoadingSecondaryDiagnoses] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPrimaryDiagnoses, setSelectedPrimaryDiagnoses] = useState<Array<Diagnosis>>([]);
  const [selectedSecondaryDiagnoses, setSelectedSecondaryDiagnoses] = useState<Array<Diagnosis>>([]);
  const [searchPrimaryResults, setSearchPrimaryResults] = useState<Array<Concept>>(null);
  const [searchSecondaryResults, setSearchSecondaryResults] = useState<Array<Concept>>(null);
  const [combinedDiagnoses, setCombinedDiagnoses] = useState<Array<Diagnosis>>([]);
  const [rows, setRows] = useState<number>();
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string>();
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

      if (isPrimaryDiagnosisRequired && selectedPrimaryDiagnoses.length === 0) {
        return {
          ...zodResult,
          errors: {
            ...zodResult.errors,
            primaryDiagnosisSearch: {
              type: 'custom',
              message: t('primaryDiagnosisRequired', 'Choose at least one primary diagnosis'),
            },
          },
        };
      }

      return zodResult;
    },
    [visitNoteFormSchema, isPrimaryDiagnosisRequired, selectedPrimaryDiagnoses, t],
  );

  const {
    clearErrors,
    control,
    formState: { errors, dirtyFields, isSubmitting },
    handleSubmit,
    getValues,
    setValue,
    watch,
  } = useForm<VisitNotesFormData>({
    mode: 'onSubmit',
    resolver: customResolver,
    defaultValues: {
      images: [],
      removedImageIds: [],
      primaryDiagnosisSearch: '',
      noteDate: isEditing ? new Date(encounter.rawDatetime) : new Date(),
      clinicalNote: isEditing
        ? String(encounter?.obs?.find((obs) => obs.concept.uuid === encounterNoteTextConceptUuid)?.value || '')
        : '',
    },
  });

  useEffect(() => {
    if (encounter?.diagnoses?.length) {
      try {
        const transformedDiagnoses = encounter.diagnoses.map((d) => ({
          patient: patientUuid,
          diagnosis: {
            coded: d.diagnosis.coded?.uuid,
          },
          certainty: d.certainty,
          rank: d.rank,
          display: d.display,
        }));

        const primaryDiagnoses = transformedDiagnoses.filter((d) => d.rank === 1);
        const secondaryDiagnoses = transformedDiagnoses.filter((d) => d.rank === 2);

        setSelectedPrimaryDiagnoses(primaryDiagnoses);
        setSelectedSecondaryDiagnoses(secondaryDiagnoses);
        setCombinedDiagnoses([...primaryDiagnoses, ...secondaryDiagnoses]);
      } catch (err) {
        setError(new Error(t('errorTransformingDiagnoses', 'Error transforming diagnoses')));
        createErrorHandler();
      }
    }
  }, [encounter, patientUuid, t]);

  const currentImages = watch('images');
  const removedImageIds = watch('removedImageIds');
  const {
    images: savedImages,
    isLoading: isLoadingSavedImages,
    error: savedImagesError,
  } = useVisitNoteImages(patientUuid, isEditing ? encounter.id : undefined);

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
      debounce((fieldQuery, fieldName) => {
        clearErrors('primaryDiagnosisSearch');
        if (fieldQuery) {
          if (fieldName === 'primaryDiagnosisSearch') {
            setIsLoadingPrimaryDiagnoses(true);
          } else if (fieldName === 'secondaryDiagnosisSearch') {
            setIsLoadingSecondaryDiagnoses(true);
          }

          fetchDiagnosisConceptsByName(fieldQuery, config.diagnosisConceptClass)
            .then((matchingConceptDiagnoses: Array<Concept>) => {
              if (fieldName === 'primaryDiagnosisSearch') {
                setSearchPrimaryResults(matchingConceptDiagnoses);
                setIsLoadingPrimaryDiagnoses(false);
              } else if (fieldName === 'secondaryDiagnosisSearch') {
                setSearchSecondaryResults(matchingConceptDiagnoses);
                setIsLoadingSecondaryDiagnoses(false);
              }
            })
            .catch((e) => {
              setError(e);
              createErrorHandler();
            });
        }
      }, SEARCH_TIMEOUT_MS),
    [config.diagnosisConceptClass, clearErrors],
  );

  const handleSearch = useCallback(
    (fieldName) => {
      const fieldQuery = watch(fieldName);
      if (fieldQuery) {
        debouncedSearch(fieldQuery, fieldName);
      }
      setIsSearching(false);
    },
    [debouncedSearch, watch],
  );

  const createDiagnosis = useCallback(
    (concept: Concept) => ({
      certainty: 'PROVISIONAL',
      display: concept.display,
      diagnosis: {
        coded: concept.uuid,
      },
      patient: patientUuid,
      rank: 2,
    }),
    [patientUuid],
  );

  const handleAddDiagnosis = useCallback(
    (conceptDiagnosisToAdd: Concept, searchInputField: string) => {
      const newDiagnosis = createDiagnosis(conceptDiagnosisToAdd);
      if (searchInputField === 'primaryDiagnosisSearch') {
        newDiagnosis.rank = 1;
        setValue('primaryDiagnosisSearch', '');
        setSearchPrimaryResults([]);
        setSelectedPrimaryDiagnoses((selectedDiagnoses) => [...selectedDiagnoses, newDiagnosis]);
        clearErrors('primaryDiagnosisSearch');
      } else if (searchInputField === 'secondaryDiagnosisSearch') {
        setValue('secondaryDiagnosisSearch', '');
        setSearchSecondaryResults([]);
        setSelectedSecondaryDiagnoses((selectedDiagnoses) => [...selectedDiagnoses, newDiagnosis]);
      }
      setCombinedDiagnoses((combinedDiagnoses) => [...combinedDiagnoses, newDiagnosis]);
    },
    [createDiagnosis, setValue, clearErrors],
  );

  const handleRemoveDiagnosis = useCallback(
    (diagnosisToRemove: Diagnosis, searchInputField) => {
      if (searchInputField === 'primaryInputSearch') {
        setSelectedPrimaryDiagnoses(
          selectedPrimaryDiagnoses.filter(
            (diagnosis) => diagnosis.diagnosis.coded !== diagnosisToRemove.diagnosis.coded,
          ),
        );
      } else if (searchInputField === 'secondaryInputSearch') {
        setSelectedSecondaryDiagnoses(
          selectedSecondaryDiagnoses.filter(
            (diagnosis) => diagnosis.diagnosis.coded !== diagnosisToRemove.diagnosis.coded,
          ),
        );
      }
      setCombinedDiagnoses(
        combinedDiagnoses.filter((diagnosis) => diagnosis.diagnosis.coded !== diagnosisToRemove.diagnosis.coded),
      );
    },
    [combinedDiagnoses, selectedPrimaryDiagnoses, selectedSecondaryDiagnoses],
  );

  const isDiagnosisNotSelected = (diagnosis: Concept) => {
    const isPrimaryDiagnosisSelected = selectedPrimaryDiagnoses.some(
      (selectedDiagnosis) => diagnosis.uuid === selectedDiagnosis.diagnosis.coded,
    );
    const isSecondaryDiagnosisSelected = selectedSecondaryDiagnoses.some(
      (selectedDiagnosis) => diagnosis.uuid === selectedDiagnosis.diagnosis.coded,
    );

    return !isPrimaryDiagnosisSelected && !isSecondaryDiagnosisSelected;
  };

  const showImageCaptureModal = useCallback(() => {
    const close = showModal('capture-photo-modal', {
      saveFile: (file: UploadedFile) => {
        if (file.capturedFromWebcam && !file.fileName.includes('.')) {
          file.fileName = `${file.fileName}.png`;
        }

        setValue('images', [...getValues('images'), file], { shouldDirty: true });
        close();
        return Promise.resolve();
      },
      closeModal: () => {
        close();
      },
      // The note only takes images. Leave this undefined until the backend list has loaded so the
      // dialog falls back to it instead of treating an empty list as "nothing allowed".
      allowedExtensions: allowedFileExtensions?.filter((ext) => !/pdf/i.test(ext)),
      collectDescription: true,
      multipleFiles: true,
      // Files are only staged here; they upload when the note is saved.
      showUploadSnackbar: false,
    });
  }, [allowedFileExtensions, getValues, setValue]);

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...currentImages];
    updatedImages.splice(index, 1);
    setValue('images', updatedImages, { shouldDirty: true });

    showSnackbar({
      title: t('imageRemoved', 'Image removed'),
      kind: 'success',
      isLowContrast: true,
    });
  };

  const onSubmit = useCallback(
    (data: VisitNotesFormData) => {
      const { noteDate, clinicalNote, images, removedImageIds } = data;
      setSaveError(undefined);

      if (isPrimaryDiagnosisRequired && !selectedPrimaryDiagnoses.length) {
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

      const saveNote = () => {
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
          .then((encounterUuid) =>
            Promise.all(
              combinedDiagnoses.map((diagnosis) => {
                const diagnosesPayload: DiagnosisPayload = {
                  encounter: encounterUuid,
                  patient: patientUuid,
                  condition: null,
                  diagnosis: {
                    coded: diagnosis.diagnosis.coded,
                  },
                  certainty: diagnosis.certainty,
                  rank: diagnosis.rank,
                };
                return savePatientDiagnosis(abortController, diagnosesPayload);
              }),
            ).then(() => encounterUuid),
          )
          .then((encounterUuid) => {
            // Only images added in this session are in the form state. Images already saved on the
            // note are shown from the server and never re-uploaded.
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
                  return createAttachment(patientUuid, imageToUpload, encounterUuid);
                }),
              );
            } else {
              return Promise.resolve([]);
            }
          });
      };
      return Promise.resolve()
        .then(async () => {
          let removedAny = false;
          let noteSaveAttempted = false;
          try {
            for (const imageId of removedImageIds) {
              await removeVisitNoteImage(imageId);
              removedAny = true;
              setRemovedImages((removed) => [...removed, imageId]);
              setValue(
                'removedImageIds',
                getValues('removedImageIds').filter((id) => id !== imageId),
                {
                  shouldDirty: true,
                },
              );
            }
            const diagnosesChanged =
              combinedDiagnoses.length !== (encounter?.diagnoses?.length ?? 0) ||
              combinedDiagnoses.some(
                (diagnosis) =>
                  !encounter?.diagnoses?.some(
                    (saved) =>
                      saved.diagnosis.coded?.uuid === diagnosis.diagnosis.coded &&
                      saved.rank === diagnosis.rank &&
                      saved.certainty === diagnosis.certainty,
                  ),
              );
            if (
              !isEditing ||
              diagnosesChanged ||
              Object.keys(dirtyFields).some((field) => field !== 'removedImageIds')
            ) {
              noteSaveAttempted = true;
              await saveNote();
            }
          } finally {
            if (removedAny || noteSaveAttempted) {
              invalidateVisitAndEncounterData(globalMutate, patientUuid);
              mutateVisitNotes();
              if (removedAny || (noteSaveAttempted && images?.length)) {
                mutateAttachments();
              }
            }
          }
        })
        .then(() => {
          closeWorkspace({ discardUnsavedChanges: true });

          showSnackbar({
            isLowContrast: true,
            subtitle: t('visitNoteNowVisible', 'It is now visible on the Visits page'),
            kind: 'success',
            title: t('visitNoteSaved', 'Visit note saved'),
          });
        })
        .catch((err) => {
          setSaveError(
            t(
              'visitNotePartialSaveError',
              'Could not save all changes. Some changes may already be saved. Try saving again.',
            ),
          );
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
      dirtyFields,
      getValues,
      setValue,
      visitContext?.uuid,
      clinicianEncounterRole,
      closeWorkspace,
      combinedDiagnoses,
      encounter?.diagnoses,
      encounter?.id,
      encounter?.obs,
      encounterNoteTextConceptUuid,
      encounterTypeUuid,
      formConceptUuid,
      globalMutate,
      isEditing,
      isPrimaryDiagnosisRequired,
      locationUuid,
      mutateAttachments,
      mutateVisitNotes,
      patientUuid,
      providerUuid,
      selectedPrimaryDiagnoses.length,
      t,
    ],
  );

  const onError = (errors) => console.error(errors);

  const hasUserUnsavedChanges = Object.keys(dirtyFields).length > 0;

  return (
    <Workspace2
      title={isEditing ? t('editVisitNote', 'Edit visit note') : t('addVisitNote', 'Add visit note')}
      hasUnsavedChanges={hasUserUnsavedChanges}
    >
      <Form className={styles.form} onSubmit={handleSubmit(onSubmit, onError)}>
        <ExtensionSlot name="visit-context-header-slot" state={visitContextHeaderState} />

        {isTablet && (
          <Row className={styles.headerGridRow}>
            <ExtensionSlot name="visit-form-header-slot" className={styles.dataGridRow} state={memoizedState} />
          </Row>
        )}

        <div className={styles.formContainer}>
          <Stack gap={2}>
            {isTablet ? (
              <h2 className={styles.heading}>
                {isEditing ? t('editVisitNote', 'Edit visit note') : t('addVisitNote', 'Add visit note')}
              </h2>
            ) : null}
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
            <div className={styles.diagnosesText}>
              {selectedPrimaryDiagnoses.map((diagnosis) => (
                <Tag
                  className={styles.tag}
                  filter
                  key={diagnosis.diagnosis.coded}
                  onClose={() => handleRemoveDiagnosis(diagnosis, 'primaryInputSearch')}
                  type="red"
                >
                  {diagnosis.display}
                </Tag>
              ))}
              {selectedSecondaryDiagnoses.map((diagnosis) => (
                <Tag
                  className={styles.tag}
                  filter
                  key={diagnosis.diagnosis.coded}
                  onClose={() => handleRemoveDiagnosis(diagnosis, 'secondaryInputSearch')}
                  type="blue"
                >
                  {diagnosis.display}
                </Tag>
              ))}
              {!selectedPrimaryDiagnoses.length && !selectedSecondaryDiagnoses.length && (
                <span>{t('emptyDiagnosisText', 'No diagnosis selected — Enter a diagnosis below')}</span>
              )}
            </div>
            <Row className={styles.row}>
              <Column sm={1}>
                <span className={styles.columnLabel}>{t('primaryDiagnosis', 'Primary diagnosis')}</span>
              </Column>
              <Column sm={3}>
                <FormGroup legendText={t('searchForPrimaryDiagnosis', 'Search for a primary diagnosis')}>
                  <DiagnosisSearch
                    name="primaryDiagnosisSearch"
                    control={control}
                    labelText={t('enterPrimaryDiagnoses', 'Enter Primary diagnoses')}
                    placeholder={t('primaryDiagnosisInputPlaceholder', 'Choose a primary diagnosis')}
                    handleSearch={handleSearch}
                    error={errors?.primaryDiagnosisSearch}
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
                    fieldName={'primaryDiagnosisSearch'}
                    isDiagnosisNotSelected={isDiagnosisNotSelected}
                    isLoading={isLoadingPrimaryDiagnoses}
                    isSearching={isSearching}
                    onAddDiagnosis={handleAddDiagnosis}
                    searchResults={searchPrimaryResults}
                    t={t}
                    value={watch('primaryDiagnosisSearch')}
                  />
                </FormGroup>
              </Column>
            </Row>
            <Row className={styles.row}>
              <Column sm={1}>
                <span className={styles.columnLabel}>{t('secondaryDiagnosis', 'Secondary diagnosis')}</span>
              </Column>
              <Column sm={3}>
                <FormGroup legendText={t('searchForSecondaryDiagnosis', 'Search for a secondary diagnosis')}>
                  <DiagnosisSearch
                    name="secondaryDiagnosisSearch"
                    control={control}
                    labelText={t('enterSecondaryDiagnoses', 'Enter Secondary diagnoses')}
                    placeholder={t('secondaryDiagnosisInputPlaceholder', 'Choose a secondary diagnosis')}
                    handleSearch={handleSearch}
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
                    fieldName={'secondaryDiagnosisSearch'}
                    isDiagnosisNotSelected={isDiagnosisNotSelected}
                    isLoading={isLoadingSecondaryDiagnoses}
                    isSearching={isSearching}
                    onAddDiagnosis={handleAddDiagnosis}
                    searchResults={searchSecondaryResults}
                    t={t}
                    value={watch('secondaryDiagnosisSearch')}
                  />
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
                  {isLoadingSavedImages && (
                    <InlineLoading
                      className={styles.savedImagesLoading}
                      description={t('loadingSavedImages', 'Loading saved images') + '...'}
                    />
                  )}
                  {savedImagesError && (
                    <InlineNotification
                      className={styles.savedImagesLoading}
                      kind="error"
                      lowContrast
                      hideCloseButton
                      title={t('savedImagesLoadError', "Couldn't load the images saved on this note")}
                      subtitle={t('savedImagesLoadErrorHint', 'Check the Attachments page before adding them again.')}
                    />
                  )}
                  <div className={styles.imgThumbnailGrid}>
                    {savedImages
                      .filter((image) => !removedImages.includes(image.id))
                      .map((image) => {
                        const isMarkedForRemoval = removedImageIds.includes(image.id);
                        const name = image.description || image.filename || t('savedImage', 'Saved image');
                        return (
                          <div key={image.id} className={styles.imgThumbnailItem}>
                            <div className={styles.imgThumbnailContainer}>
                              <img
                                className={classnames(styles.imgThumbnail, {
                                  [styles.pendingImage]: isMarkedForRemoval,
                                })}
                                src={image.src}
                                alt={name}
                              />
                            </div>
                            {isMarkedForRemoval && (
                              <p className={styles.removalStatus}>{t('imageMarkedForRemoval', 'Marked for removal')}</p>
                            )}
                            <Button
                              kind={isMarkedForRemoval ? 'ghost' : 'secondary'}
                              size="sm"
                              disabled={isSubmitting}
                              aria-label={
                                isMarkedForRemoval
                                  ? t('undoRemoveImage', 'Undo removal: {{name}}', {
                                      name: name,
                                    })
                                  : t('removeImage', 'Remove image: {{name}}', {
                                      name: name,
                                    })
                              }
                              className={isMarkedForRemoval ? styles.undoButton : styles.removeButton}
                              onClick={() =>
                                setValue(
                                  'removedImageIds',
                                  isMarkedForRemoval
                                    ? removedImageIds.filter((id) => id !== image.id)
                                    : [...removedImageIds, image.id],
                                  { shouldDirty: true },
                                )
                              }
                            >
                              {isMarkedForRemoval ? t('undo', 'Undo') : <Close size={16} />}
                            </Button>
                          </div>
                        );
                      })}
                    {currentImages?.map((image, index) => (
                      <div key={index} className={styles.imgThumbnailItem}>
                        <div className={styles.imgThumbnailContainer}>
                          <img
                            className={styles.imgThumbnail}
                            src={image.base64Content}
                            alt={image.fileDescription ?? image.fileName}
                          />
                        </div>
                        <Button
                          kind="secondary"
                          size="sm"
                          aria-label={t('removeImage', 'Remove image: {{name}}', {
                            name: image.fileDescription?.trim() || image.fileName?.trim() || index + 1,
                          })}
                          className={styles.removeButton}
                          onClick={() => handleRemoveImage(index)}
                        >
                          <Close size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {removedImageIds.length > 0 && (
                    <p className={styles.removalHint}>
                      {t('imageRemovalSaveHint', 'Images marked for removal will be deleted when you save.')}
                    </p>
                  )}
                </FormGroup>
              </Column>
            </Row>
          </Stack>
        </div>
        {saveError && (
          <InlineNotification
            kind="error"
            lowContrast
            hideCloseButton
            title={t('visitNoteSaveError', 'Error saving visit note')}
            subtitle={saveError}
          />
        )}
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
  const inputRef = useRef<HTMLInputElement>(null);

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
                handleSearch(name);
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                  const results = document.getElementById(`${name}-results`)?.querySelectorAll('button');
                  if (results?.length) {
                    event.preventDefault();
                    results[event.key === 'ArrowDown' ? 0 : results.length - 1].focus();
                  }
                }
              }}
              value={value instanceof Date ? value.toISOString() : value}
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
  fieldName,
  isDiagnosisNotSelected,
  isLoading,
  isSearching,
  onAddDiagnosis,
  searchResults,
  t,
  value,
}: DiagnosesDisplayProps) {
  const resultsRef = useRef<HTMLUListElement | null>(null);
  const setResultsRef = useCallback(
    (node: HTMLUListElement | null) => {
      if (!node && resultsRef.current?.contains(document.activeElement)) {
        document.getElementById(fieldName)?.focus();
      }
      resultsRef.current = node;
    },
    [fieldName],
  );
  if (!value) {
    return null;
  }

  if (isSearching || isLoading) {
    return <Loader />;
  }

  if (!isSearching && searchResults?.length > 0) {
    return (
      <ul
        ref={setResultsRef}
        id={`${fieldName}-results`}
        className={styles.diagnosisList}
        aria-label={t('diagnosisSearchResults', 'Diagnosis search results')}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            document.getElementById(fieldName)?.focus();
          } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
            const results = Array.from(event.currentTarget.querySelectorAll('button'));
            const index = results.findIndex((result) => result === document.activeElement);
            if (index < 0) {
              return;
            }
            event.preventDefault();
            const nextIndex =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? results.length - 1
                  : (index + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
            results[nextIndex].focus();
          }
        }}
      >
        {searchResults.filter(isDiagnosisNotSelected).map((diagnosis) => (
          <li className={styles.diagnosis} key={diagnosis.uuid}>
            <button
              type="button"
              className={styles.diagnosisButton}
              onClick={() => {
                onAddDiagnosis(diagnosis, fieldName);
                document.getElementById(fieldName)?.focus();
              }}
            >
              {diagnosis.display}
            </button>
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
