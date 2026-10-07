import React, { useCallback, useMemo, useRef, useState } from 'react';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { debounce } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useController, useForm, type Control, type FieldErrors } from 'react-hook-form';
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
import { Add, Close, WarningAltFilled, WarningFilled } from '@carbon/react/icons';
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
  removeVisitNoteImage,
  savePatientDiagnosis,
  saveVisitNote,
  updateVisitNote,
  useDiagnosisConceptClasses,
  useVisitNoteImages,
  useVisitNotes,
} from './visit-notes.resource';
import SelectedDiagnosisCard, {
  DiagnosisListHeader,
  type DiagnosisDraft,
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
  handleSearch: () => void;
  labelText: string;
  name: 'diagnosisSearch';
  placeholder: string;
  setIsSearching: (isSearching: boolean) => void;
}

const hasPrimaryDiagnosis = (diagnoses: Array<DiagnosisDraft>) => diagnoses.some((diagnosis) => diagnosis.rank === 1);

const createSchema = (t: TFunction, isRetrospectiveDataEntryEnabled: boolean, isPrimaryDiagnosisRequired: boolean) => {
  return z.object({
    noteDate: isRetrospectiveDataEntryEnabled ? z.date() : z.date().optional(),
    diagnosisSearch: z.string().optional(),
    diagnoses: z
      .array(z.custom<DiagnosisDraft>())
      .refine((diagnoses) => !isPrimaryDiagnosisRequired || hasPrimaryDiagnosis(diagnoses), {
        message: t('atLeastOnePrimaryDiagnosis', 'At least one diagnosis must be selected as primary'),
      }),
    clinicalNote: z.string().optional(),
    images: z.array(z.any()).optional(),
    removedImageIds: z.array(z.string()),
  });
};

const SEARCH_TIMEOUT_MS = 500;

/**
 * Other REST writers can store a diagnosis with neither a coded concept nor free text. The form
 * cannot represent such a row, so it is left on the encounter untouched: not shown, not deleted,
 * not recreated.
 */
const hasDiagnosisContent = (diagnosis: NonNullable<Encounter['diagnoses']>[number]) =>
  Boolean(diagnosis.diagnosis?.coded?.uuid || diagnosis.diagnosis?.nonCoded);

// Sort stored primaries once; subsequent edits keep rows under the pointer in place.
const toDiagnosisDrafts = (encounter: Encounter | undefined, patientUuid: string): Array<DiagnosisDraft> =>
  (encounter?.diagnoses ?? [])
    .filter(hasDiagnosisContent)
    .map(
      (d): DiagnosisDraft => ({
        draftId: nextDraftId(),
        patient: patientUuid,
        diagnosis: d.diagnosis.coded?.uuid ? { coded: d.diagnosis.coded.uuid } : { nonCoded: d.diagnosis.nonCoded },
        certainty: d.certainty === 'PROVISIONAL' ? 'PROVISIONAL' : 'CONFIRMED',
        rank: d.rank ?? 2,
        display: d.display,
      }),
    )
    .sort((a, b) => Number(b.rank === 1) - Number(a.rank === 1));

/** Image formats browsers render, so a staged file always has a real thumbnail. */
const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']);

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
  const isEditing: boolean = Boolean(formContext === 'editing' && encounter?.uuid);
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const { isPrimaryDiagnosisRequired, ...config } = useConfig<ConfigObject>();
  const visitContextHeaderState = useMemo(() => ({ patientUuid }), [patientUuid]);
  const memoizedState = useMemo(() => ({ patientUuid, patient }), [patientUuid, patient]);
  const { clinicianEncounterRole, encounterNoteTextConceptUuid, encounterTypeUuid, formConceptUuid } =
    config.visitNoteConfig;
  const [isLoadingDiagnoses, setIsLoadingDiagnoses] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<Concept>>(null);
  const [rows, setRows] = useState<number>();
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string>();
  const [error, setError] = useState<Error>(null);
  const {
    allowedFileExtensions,
    error: allowedFileExtensionsError,
    isLoading: isLoadingAllowedFileExtensions,
  } = useAllowedFileExtensions();
  const allowedImageExtensions = useMemo(() => {
    const extensions = allowedFileExtensions?.map((extension) => extension.trim().toLowerCase()).filter(Boolean);
    return extensions?.length ? extensions.filter((extension) => imageExtensions.has(extension)) : [...imageExtensions];
  }, [allowedFileExtensions]);
  const isImageCaptureDisabled =
    isLoadingAllowedFileExtensions || Boolean(allowedFileExtensionsError) || allowedImageExtensions.length === 0;
  const isRetrospectiveDataEntryEnabled = useFeatureFlag('rde');

  const visitNoteFormSchema = useMemo(
    () => createSchema(t, isRetrospectiveDataEntryEnabled, isPrimaryDiagnosisRequired),
    [t, isRetrospectiveDataEntryEnabled, isPrimaryDiagnosisRequired],
  );

  const [initialDiagnoses] = useState(() => toDiagnosisDrafts(encounter, patientUuid));

  const {
    control,
    formState: { dirtyFields, isSubmitted, isSubmitting },
    getValues,
    handleSubmit,
    setValue,
    watch,
  } = useForm<VisitNotesFormData>({
    mode: 'onSubmit',
    resolver: zodResolver(visitNoteFormSchema),
    defaultValues: {
      images: [],
      removedImageIds: [],
      diagnosisSearch: '',
      diagnoses: initialDiagnoses,
      noteDate: isEditing ? new Date(encounter.encounterDatetime) : new Date(),
      clinicalNote: isEditing
        ? String(encounter?.obs?.find((obs) => obs.concept.uuid === encounterNoteTextConceptUuid)?.value || '')
        : '',
    },
  });

  const {
    field: { value: selectedDiagnoses, onChange: setSelectedDiagnoses },
  } = useController({ name: 'diagnoses', control });

  const currentImages = watch('images');
  const removedImageIds = watch('removedImageIds');
  const {
    images: savedImages,
    isLoading: isLoadingSavedImages,
    error: savedImagesError,
  } = useVisitNoteImages(patientUuid, isEditing ? encounter.uuid : undefined);

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
    [config.diagnosisConceptClass],
  );

  const handleSearch = useCallback(() => {
    const fieldQuery = watch('diagnosisSearch');
    if (fieldQuery) {
      debouncedSearch(fieldQuery);
    }
    setIsSearching(false);
  }, [debouncedSearch, watch]);

  const createDiagnosis = useCallback(
    (concept: Concept): DiagnosisDraft => ({
      draftId: nextDraftId(),
      display: concept.display,
      diagnosis: {
        coded: concept.uuid,
      },
      patient: patientUuid,
      rank: 2,
      certainty: 'CONFIRMED',
      conceptClassUuid: config.diagnosisConceptClass,
    }),
    [config.diagnosisConceptClass, patientUuid],
  );

  const prefilledCodedConceptUuids = useMemo(
    () =>
      Array.from(
        new Set(
          initialDiagnoses.flatMap((diagnosis) => (diagnosis.diagnosis.coded ? [diagnosis.diagnosis.coded] : [])),
        ),
      ),
    [initialDiagnoses],
  );
  const { conceptClassByUuid, error: conceptClassLookupError } = useDiagnosisConceptClasses(prefilledCodedConceptUuids);
  // Only diagnosis-class concepts get certainty actions; free-text diagnoses also qualify.
  const canMarkProvisional = useCallback(
    (diagnosis: DiagnosisDraft) => {
      if (!diagnosis.diagnosis.coded) {
        return true;
      }
      const conceptClassUuid = diagnosis.conceptClassUuid ?? conceptClassByUuid[diagnosis.diagnosis.coded];
      if (conceptClassUuid === undefined) {
        // Unknown while the lookup is pending; if it failed, keep the action rather than
        // stranding a stored provisional diagnosis with no way to confirm it
        return Boolean(conceptClassLookupError);
      }
      if (conceptClassUuid === null) {
        // The lookup answered but left this concept out: treat it like a failed lookup
        return true;
      }
      return conceptClassUuid === config.diagnosisConceptClass;
    },
    [conceptClassByUuid, conceptClassLookupError, config.diagnosisConceptClass],
  );

  const handleAddDiagnosis = useCallback(
    (conceptDiagnosisToAdd: Concept) => {
      setValue('diagnosisSearch', '', { shouldDirty: true });
      setSearchResults([]);
      const diagnoses = getValues('diagnoses');
      // Guards against a double-click on the same result racing the render-time filter
      if (diagnoses.some((diagnosis) => diagnosis.diagnosis.coded === conceptDiagnosisToAdd.uuid)) {
        return;
      }
      setSelectedDiagnoses([createDiagnosis(conceptDiagnosisToAdd), ...diagnoses]);
    },
    [createDiagnosis, getValues, setSelectedDiagnoses, setValue],
  );

  const handleRemoveDiagnosis = useCallback(
    (diagnosisToRemove: DiagnosisDraft) => {
      setSelectedDiagnoses(
        getValues('diagnoses').filter((diagnosis) => diagnosis.draftId !== diagnosisToRemove.draftId),
      );
      // The focused remove button unmounts with its card; return focus to the search input
      document.getElementById('diagnosisSearch')?.focus();
    },
    [getValues, setSelectedDiagnoses],
  );

  const handleUpdateDiagnosis = useCallback(
    (diagnosisToUpdate: DiagnosisDraft, patch: Partial<Pick<DiagnosisDraft, 'rank' | 'certainty'>>) => {
      setSelectedDiagnoses(
        getValues('diagnoses').map((diagnosis) =>
          diagnosis.draftId === diagnosisToUpdate.draftId ? { ...diagnosis, ...patch } : diagnosis,
        ),
      );
    },
    [getValues, setSelectedDiagnoses],
  );

  const isDiagnosisNotSelected = (diagnosis: Concept) =>
    !selectedDiagnoses.some((selectedDiagnosis) => diagnosis.uuid === selectedDiagnosis.diagnosis.coded);

  const showImageCaptureModal = useCallback(() => {
    if (isImageCaptureDisabled) {
      return;
    }

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
      allowedExtensions: allowedImageExtensions,
      collectDescription: true,
      multipleFiles: true,
      // Files are only staged here; they upload when the note is saved.
      showUploadSnackbar: false,
    });
  }, [allowedImageExtensions, getValues, isImageCaptureDisabled, setValue]);

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
      const { noteDate, clinicalNote, images, removedImageIds, diagnoses } = data;
      setSaveError(undefined);

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
          ? updateVisitNote(abortController, encounter.uuid, visitNotePayload)
          : saveVisitNote(abortController, visitNotePayload);

        return savePromise
          .then((response) => {
            if (response.status === 201 || response.status === 200) {
              const encounterUuid = encounter?.uuid || response.data.uuid;

              const storedDiagnoses = encounter?.diagnoses?.filter(hasDiagnosisContent) ?? [];
              if (isEditing && storedDiagnoses.length) {
                return Promise.all(
                  storedDiagnoses.map((diagnosis) => deletePatientDiagnosis(abortController, diagnosis.uuid)),
                ).then(() => encounterUuid);
              }

              return encounterUuid;
            }
          })
          .then((encounterUuid) =>
            Promise.all(
              diagnoses.map((diagnosis) => {
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
            ).then(() => encounterUuid),
          )
          .then((encounterUuid) => {
            // Only images added in this session are in the form state. Images already saved on the
            // note are shown from the server and never re-uploaded.
            if (!images?.length) {
              return [];
            }
            // The note and its diagnoses are already saved by now, so one rejected image must not
            // fail the whole save: every image that can upload does, and the rest are reported.
            return Promise.allSettled(
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
            ).then((results) =>
              results.flatMap((result, index) =>
                result.status === 'rejected' ? [{ image: images[index], reason: result.reason }] : [],
              ),
            );
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
            if (!isEditing || Object.keys(dirtyFields).some((field) => field !== 'removedImageIds')) {
              noteSaveAttempted = true;
              return await saveNote();
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
        .then((failedUploads = []) => {
          closeWorkspace({ discardUnsavedChanges: true });

          if (failedUploads.length) {
            const [{ reason }] = failedUploads;
            const names = failedUploads
              .map(({ image }) => image.fileDescription?.trim() || image.fileName?.trim())
              .filter(Boolean)
              .join(', ');
            showSnackbar({
              isLowContrast: false,
              kind: 'warning',
              title: t('visitNoteSavedImagesFailed', 'Visit note saved, but {{count}} image was not uploaded', {
                count: failedUploads.length,
              }),
              subtitle: [names, reason?.responseBody?.error?.message ?? reason?.message]
                .filter(Boolean)
                .join(': ')
                .concat(
                  ' ',
                  t('reAddImagesFromNote', 'Open the note to add it again.', { count: failedUploads.length }),
                ),
            });
            return;
          }

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
      encounter?.diagnoses,
      encounter?.uuid,
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
      t,
    ],
  );

  const onError = useCallback(
    (errors: FieldErrors<VisitNotesFormData>) => {
      console.error(errors);
      // A failed save lands focus on the first Primary checkbox so the missing primary can
      // be fixed in place (or on the search input when nothing has been selected yet)
      if (errors.diagnoses) {
        const firstDraftId = getValues('diagnoses')[0]?.draftId;
        const target =
          firstDraftId === undefined
            ? document.getElementById('diagnosisSearch')
            : document.getElementById(`diagnosis-${firstDraftId}-primary`);
        target?.focus();
      }
    },
    [getValues],
  );

  const hasUserUnsavedChanges = Object.keys(dirtyFields).length > 0;

  // Show a live warning, escalating to an error after a blocked save.
  const showPrimaryRequiredWarning =
    isPrimaryDiagnosisRequired &&
    !hasPrimaryDiagnosis(selectedDiagnoses) &&
    (selectedDiagnoses.length > 0 || isSubmitted);
  const primaryRequiredBlockedSave = showPrimaryRequiredWarning && isSubmitted;

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
            <Row className={styles.row}>
              <Column sm={1}>
                <span className={styles.columnLabel}>
                  {t('diagnosis', 'Diagnosis')}
                  {isPrimaryDiagnosisRequired && (
                    <span title={t('required', 'Required')} className={styles.required}>
                      *
                    </span>
                  )}
                </span>
              </Column>
              <Column sm={3}>
                <FormGroup legendText="">
                  <DiagnosisSearch
                    name="diagnosisSearch"
                    control={control}
                    labelText={t('searchForDiagnosis', 'Search for a diagnosis to add')}
                    placeholder={t('diagnosisInputPlaceholder', 'Search for a diagnosis')}
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
                    isDiagnosisNotSelected={isDiagnosisNotSelected}
                    isLoading={isLoadingDiagnoses}
                    isSearching={isSearching}
                    onAddDiagnosis={handleAddDiagnosis}
                    searchResults={searchResults}
                    t={t}
                    value={watch('diagnosisSearch')}
                  />
                  {selectedDiagnoses.length > 0 && (
                    <>
                      <p className={styles.diagnosisHelperText}>
                        {t(
                          'diagnosisCertaintyHelperText',
                          'Diagnoses are recorded as confirmed unless marked provisional.',
                        )}
                      </p>
                      <DiagnosisListHeader />
                      {selectedDiagnoses.map((diagnosis) => (
                        <SelectedDiagnosisCard
                          key={diagnosis.draftId}
                          canMarkProvisional={canMarkProvisional(diagnosis)}
                          diagnosis={diagnosis}
                          onRemove={handleRemoveDiagnosis}
                          onUpdate={handleUpdateDiagnosis}
                        />
                      ))}
                    </>
                  )}
                  {showPrimaryRequiredWarning && (
                    <p
                      id="primary-diagnosis-requirement"
                      className={classnames(styles.primaryRequiredWarning, {
                        [styles.primaryRequiredError]: primaryRequiredBlockedSave,
                      })}
                      role={primaryRequiredBlockedSave ? 'alert' : 'status'}
                    >
                      {primaryRequiredBlockedSave ? (
                        <WarningFilled aria-hidden="true" size={16} />
                      ) : (
                        <WarningAltFilled aria-hidden="true" size={16} />
                      )}
                      {t('atLeastOnePrimaryDiagnosis', 'At least one diagnosis must be selected as primary')}
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
                    disabled={isImageCaptureDisabled}
                    kind={isTablet ? 'ghost' : 'tertiary'}
                    onClick={showImageCaptureModal}
                    renderIcon={(props) => <Add size={16} {...props} />}
                  >
                    {t('addImage', 'Add image')}
                  </Button>
                  {allowedFileExtensionsError && (
                    <InlineNotification
                      className={styles.savedImagesLoading}
                      kind="error"
                      lowContrast
                      hideCloseButton
                      title={t('allowedFileExtensionsLoadError', "Couldn't load the allowed image formats")}
                      subtitle={t('allowedFileExtensionsLoadErrorHint', 'Reload the page to add images to this note.')}
                    />
                  )}
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
                            alt={image.fileDescription || image.fileName}
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
  setIsSearching,
}: DiagnosisSearchProps) {
  const isTablet = useLayoutType() === 'tablet';

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, onBlur } }) => (
        <ResponsiveWrapper>
          <Search
            size={isTablet ? 'lg' : 'md'}
            id={name}
            labelText={labelText}
            placeholder={placeholder}
            onChange={(e) => {
              setIsSearching(true);
              onChange(e);
              handleSearch();
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
            value={value}
            onBlur={onBlur}
          />
        </ResponsiveWrapper>
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
  const resultsRef = useRef<HTMLUListElement | null>(null);
  // When loading unmounts a focused result, return focus to the search input rather than
  // dropping it on <body>; leave focus alone when the user has moved elsewhere
  const setResultsRef = useCallback((node: HTMLUListElement | null) => {
    if (!node && resultsRef.current?.contains(document.activeElement)) {
      document.getElementById('diagnosisSearch')?.focus();
    }
    resultsRef.current = node;
  }, []);
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
        id="diagnosisSearch-results"
        className={styles.diagnosisList}
        aria-label={t('diagnosisSearchResults', 'Diagnosis search results')}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            document.getElementById('diagnosisSearch')?.focus();
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
                onAddDiagnosis(diagnosis);
                document.getElementById('diagnosisSearch')?.focus();
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
