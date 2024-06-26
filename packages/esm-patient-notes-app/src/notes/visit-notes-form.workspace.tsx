import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classnames from 'classnames';
import dayjs from 'dayjs';
import debounce from 'lodash-es/debounce';
import { useTranslation, type TFunction } from 'react-i18next';
import { mutate } from 'swr';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, type Control } from 'react-hook-form';
import {
  Button,
  ButtonSet,
  Column,
  DatePicker,
  DatePickerInput,
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
import { Add, WarningFilled, CloseFilled } from '@carbon/react/icons';
import {
  createAttachment,
  createErrorHandler,
  ExtensionSlot,
  ResponsiveWrapper,
  restBaseUrl,
  showModal,
  showSnackbar,
  type UploadedFile,
  useConfig,
  useLayoutType,
  useSession,
} from '@openmrs/esm-framework';
import { type DefaultPatientWorkspaceProps, useAllowedFileExtensions } from '@openmrs/esm-patient-common-lib';
import type { ConfigObject } from '../config-schema';
import type { Concept, Diagnosis, DiagnosisPayload, VisitNotePayload } from '../types';
import {
  fetchDiagnosisConceptsByName,
  savePatientDiagnosis,
  saveVisitNote,
  useInfiniteVisits,
  useVisitNotes,
} from './visit-notes.resource';
import styles from './visit-notes-form.scss';

type VisitNotesFormData = Omit<z.infer<typeof visitNoteFormSchema>, 'images'> & {
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
  error?: Object;
  handleSearch: (fieldName) => void;
  labelText: string;
  name: 'noteDate' | 'primaryDiagnosisSearch' | 'secondaryDiagnosisSearch' | 'clinicalNote';
  placeholder: string;
  setIsSearching: (isSearching: boolean) => void;
}

const visitNoteFormSchema = z.object({
  noteDate: z.date(),
  primaryDiagnosisSearch: z.string({
    required_error: 'Choose at least one primary diagnosis',
  }),
  secondaryDiagnosisSearch: z.string().optional(),
  clinicalNote: z.string().optional(),
  images: z
    .array(
      z.object({
        base64Content: z.string(),
        file: z.custom<File>((value) => value instanceof File, {
          message: 'Invalid file',
        }),
        fileDescription: z.string().optional(),
        fileName: z.string(),
        fileType: z.string(),
      }),
    )
    .optional(),
});

const VisitNotesForm: React.FC<DefaultPatientWorkspaceProps> = ({
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  patientUuid,
  promptBeforeClosing,
}) => {
  const searchTimeoutInMs = 500;
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const config = useConfig<ConfigObject>();
  const memoizedState = useMemo(() => ({ patientUuid }), [patientUuid]);
  const { clinicianEncounterRole, encounterNoteTextConceptUuid, encounterTypeUuid, formConceptUuid } =
    config.visitNoteConfig;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPrimaryDiagnoses, setIsLoadingPrimaryDiagnoses] = useState(false);
  const [isLoadingSecondaryDiagnoses, setIsLoadingSecondaryDiagnoses] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPrimaryDiagnoses, setSelectedPrimaryDiagnoses] = useState<Array<Diagnosis>>([]);
  const [selectedSecondaryDiagnoses, setSelectedSecondaryDiagnoses] = useState<Array<Diagnosis>>([]);
  const [searchPrimaryResults, setSearchPrimaryResults] = useState<Array<Concept>>(null);
  const [searchSecondaryResults, setSearchSecondaryResults] = useState<Array<Concept>>(null);
  const [combinedDiagnoses, setCombinedDiagnoses] = useState<Array<Diagnosis>>([]);
  const [rows, setRows] = useState<number>();
  const [error, setError] = useState<Error>(null);
  const { allowedFileExtensions } = useAllowedFileExtensions();

  const { control, handleSubmit, watch, getValues, setValue, formState } = useForm<VisitNotesFormData>({
    mode: 'onSubmit',
    resolver: zodResolver(visitNoteFormSchema),
    defaultValues: {
      noteDate: new Date(),
    },
  });

  const { isDirty } = formState;

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  const currentImages = watch('images');

  const { mutateVisitNotes } = useVisitNotes(patientUuid);
  const { mutateVisits } = useInfiniteVisits(patientUuid);
  const mutateAttachments = () =>
    mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/attachment`));

  const locationUuid = session?.sessionLocation?.uuid;
  const providerUuid = session?.currentProvider?.uuid;

  const debouncedSearch = useMemo(
    () =>
      debounce((fieldQuery, fieldName) => {
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
      }, searchTimeoutInMs),
    [config.diagnosisConceptClass],
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

  const handleAddDiagnosis = (conceptDiagnosisToAdd: Concept, searchInputField: string) => {
    let newDiagnosis = createDiagnosis(conceptDiagnosisToAdd);
    if (searchInputField === 'primaryDiagnosisSearch') {
      newDiagnosis.rank = 1;
      setValue('primaryDiagnosisSearch', '');
      setSearchPrimaryResults([]);
      setSelectedPrimaryDiagnoses((selectedDiagnoses) => [...selectedDiagnoses, newDiagnosis]);
    } else if (searchInputField === 'secondaryDiagnosisSearch') {
      setValue('secondaryDiagnosisSearch', '');
      setSearchSecondaryResults([]);
      setSelectedSecondaryDiagnoses((selectedDiagnoses) => [...selectedDiagnoses, newDiagnosis]);
    }
    setCombinedDiagnoses((diagnosisCombined) => [...diagnosisCombined, newDiagnosis]);
  };

  const handleRemoveDiagnosis = (diagnosisToRemove: Diagnosis, searchInputField: string) => {
    if (searchInputField === 'primaryInputSearch') {
      setSelectedPrimaryDiagnoses(
        selectedPrimaryDiagnoses.filter((diagnosis) => diagnosis.diagnosis.coded !== diagnosisToRemove.diagnosis.coded),
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
  };

  const isDiagnosisNotSelected = (diagnosis: Concept) => {
    const isPrimaryDiagnosisSelected = selectedPrimaryDiagnoses.some(
      (selectedDiagnosis) => diagnosis.uuid === selectedDiagnosis.diagnosis.coded,
    );
    const isSecondaryDiagnosisSelected = selectedSecondaryDiagnoses.some(
      (selectedDiagnosis) => diagnosis.uuid === selectedDiagnosis.diagnosis.coded,
    );

    return !isPrimaryDiagnosisSelected && !isSecondaryDiagnosisSelected;
  };

  const createDiagnosis = (concept: Concept) => ({
    certainty: 'PROVISIONAL',
    display: concept.display,
    diagnosis: {
      coded: concept.uuid,
    },
    patient: patientUuid,
    rank: 2,
  });

  const showImageCaptureModal = useCallback(() => {
    const close = showModal('capture-photo-modal', {
      saveFile: (file: UploadedFile) => {
        if (file) {
          setValue('images', currentImages ? [...currentImages, file] : [file]);
        }

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
      setIsSubmitting(true);

      if (!selectedPrimaryDiagnoses.length) {
        setIsSubmitting(false);
        return;
      }

      let finalNoteDate = dayjs(noteDate);
      const now = new Date();
      if (finalNoteDate.diff(now, 'minute') <= 30) {
        finalNoteDate = null;
      }

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
          ? [{ concept: { uuid: encounterNoteTextConceptUuid, display: '' }, value: clinicalNote }]
          : [],
      };

      const abortController = new AbortController();

      saveVisitNote(abortController, visitNotePayload)
        .then((response) => {
          if (response.status === 201) {
            return Promise.all(
              combinedDiagnoses.map((diagnosis, position: number) => {
                const diagnosesPayload: DiagnosisPayload = {
                  encounter: response.data.uuid,
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
            );
          }
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
          mutateVisitNotes();
          mutateVisits();

          if (images?.length) {
            mutateAttachments();
          }

          closeWorkspaceWithSavedChanges();

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
            subtitle: err?.message,
          });
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    },
    [
      clinicianEncounterRole,
      closeWorkspaceWithSavedChanges,
      combinedDiagnoses,
      encounterNoteTextConceptUuid,
      encounterTypeUuid,
      formConceptUuid,
      locationUuid,
      mutateVisitNotes,
      mutateVisits,
      patientUuid,
      providerUuid,
      selectedPrimaryDiagnoses.length,
      t,
    ],
  );

  const onError = (errors) => console.error(errors);

  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit, onError)}>
      {isTablet && (
        <Row className={styles.headerGridRow}>
          <ExtensionSlot name="visit-form-header-slot" className={styles.dataGridRow} state={memoizedState} />
        </Row>
      )}
      <Stack className={styles.formContainer} gap={2}>
        {isTablet ? <h2 className={styles.heading}>{t('addVisitNote', 'Add a visit note')}</h2> : null}
        <Row className={styles.row}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('date', 'Date')}</span>
          </Column>
          <Column sm={3}>
            <Controller
              name="noteDate"
              control={control}
              render={({ field: { onChange, value } }) => (
                <ResponsiveWrapper>
                  <DatePicker
                    dateFormat="d/m/Y"
                    datePickerType="single"
                    maxDate={new Date().toISOString()}
                    value={value}
                    onChange={([date]) => onChange(date)}
                  >
                    <DatePickerInput
                      id="visitDateTimePicker"
                      labelText={t('visitDate', 'Visit date')}
                      placeholder="dd/mm/yyyy"
                    />
                  </DatePicker>
                </ResponsiveWrapper>
              )}
            />
          </Column>
        </Row>
        <div className={styles.diagnosesText}>
          {selectedPrimaryDiagnoses && selectedPrimaryDiagnoses.length ? (
            <>
              {selectedPrimaryDiagnoses.map((diagnosis, index) => (
                <Tag
                  className={styles.tag}
                  filter
                  key={index}
                  onClose={() => handleRemoveDiagnosis(diagnosis, 'primaryInputSearch')}
                  type="red"
                >
                  {diagnosis.display}
                </Tag>
              ))}
            </>
          ) : null}
          {selectedSecondaryDiagnoses && selectedSecondaryDiagnoses.length ? (
            <>
              {selectedSecondaryDiagnoses.map((diagnosis, index) => (
                <Tag
                  classname={styles.tag}
                  filter
                  key={index}
                  onClose={() => handleRemoveDiagnosis(diagnosis, 'secondaryInputSearch')}
                  type="blue"
                >
                  {diagnosis.display}
                </Tag>
              ))}
            </>
          ) : null}
          {selectedPrimaryDiagnoses &&
            !selectedPrimaryDiagnoses.length &&
            selectedSecondaryDiagnoses &&
            !selectedSecondaryDiagnoses.length && (
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
                error={formState?.errors?.primaryDiagnosisSearch}
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
      <ButtonSet className={classnames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary" onClick={handleSubmit} disabled={isSubmitting} type="submit">
          {isSubmitting ? (
            <InlineLoading description={t('saving', 'Saving') + '...'} />
          ) : (
            <span>{t('saveAndClose', 'Save and close')}</span>
          )}
        </Button>
      </ButtonSet>
    </Form>
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
              className={error && styles.diagnosisErrorOutline}
              placeholder={placeholder}
              renderIcon={error && ((props) => <WarningFilled fill="red" {...props} />)}
              onChange={(e) => {
                setIsSearching(true);
                onChange(e);
                handleSearch(name);
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
  fieldName,
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
        {searchResults.map((diagnosis, index) => {
          if (isDiagnosisNotSelected(diagnosis)) {
            return (
              <li
                className={styles.diagnosis}
                key={index}
                onClick={() => onAddDiagnosis(diagnosis, fieldName)}
                role="menuitem"
              >
                {diagnosis.display}
              </li>
            );
          }
        })}
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
