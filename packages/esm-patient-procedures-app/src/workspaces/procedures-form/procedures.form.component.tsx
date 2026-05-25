import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Button,
  ButtonSet,
  ComboBox,
  ContentSwitcher,
  Form,
  FormGroup,
  InlineLoading,
  InlineNotification,
  NumberInput,
  Stack,
  Switch,
  TextArea,
} from '@carbon/react';
import { ResponsiveWrapper, showSnackbar, useConfig, useLayoutType } from '@openmrs/esm-framework';
import type { ConfigObject } from '../../config-schema';
import {
  saveProcedure,
  updateProcedure,
  useConceptSearch,
  useConceptSearchField,
  useMutatePatientProcedures,
  useProcedureTypes,
} from '../../procedures.resource';
import type { ConceptReference, Procedure, ProcedureType } from '../../types';
import type { ProceduresFormSchema } from './procedures-form.workspace';
import { ConceptSearchField } from '../../components/concept-search-field/concept-search-field.component';
import { DateTimeField } from '../../components/date-time-field/date-time-field.component';
import styles from './procedures-form.scss';

type ProceduresFormComponentProps = {
  closeWorkspace: () => void;
  procedure?: Procedure;
  patientUuid: string;
};

const ProceduresFormComponent: React.FC<ProceduresFormComponentProps> = ({
  closeWorkspace,
  patientUuid,
  procedure,
}) => {
  const { t } = useTranslation();
  const {
    procedureConceptUuid,
    procedureConceptSourceType,
    bodySiteConceptUuid,
    bodySiteConceptSourceType,
    statusConceptUuid,
    statusConceptSourceType,
    durationUnitConceptUuid,
    durationUnitConceptSourceType,
  } = useConfig<ConfigObject>();
  const mutate = useMutatePatientProcedures(patientUuid);

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitted },
    getValues,
    setValue,
    trigger,
  } = useFormContext<ProceduresFormSchema>();

  const { procedureTypes, isLoading: isLoadingProcedureTypes } = useProcedureTypes();

  const isTablet = useLayoutType() === 'tablet';
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isStartDateKnown, setIsStartDateKnown] = useState(!getValues('estimatedStartDate'));
  const initialEstimatedDate = getValues('estimatedStartDate');
  const [estimatedYear, setEstimatedYear] = useState(initialEstimatedDate?.split('-')[0] ?? '');
  const [estimatedMonth, setEstimatedMonth] = useState(initialEstimatedDate?.split('-')[1] ?? '');

  useEffect(() => {
    const value =
      !isStartDateKnown && estimatedYear ? (estimatedMonth ? `${estimatedYear}-${estimatedMonth}` : estimatedYear) : '';
    setValue('estimatedStartDate', value);
    if (isSubmitted) {
      trigger('startDateTime');
    }
  }, [isStartDateKnown, estimatedYear, estimatedMonth, setValue, isSubmitted, trigger]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1900 + 1 }, (_, i) => ({
      id: String(currentYear - i),
      label: String(currentYear - i),
    }));
  }, []);

  const monthOptions = useMemo(
    () => [
      { id: '01', label: t('january', 'January') },
      { id: '02', label: t('february', 'February') },
      { id: '03', label: t('march', 'March') },
      { id: '04', label: t('april', 'April') },
      { id: '05', label: t('may', 'May') },
      { id: '06', label: t('june', 'June') },
      { id: '07', label: t('july', 'July') },
      { id: '08', label: t('august', 'August') },
      { id: '09', label: t('september', 'September') },
      { id: '10', label: t('october', 'October') },
      { id: '11', label: t('november', 'November') },
      { id: '12', label: t('december', 'December') },
    ],
    [t],
  );

  const procedureField = useConceptSearchField({ uuid: procedureConceptUuid, sourceType: procedureConceptSourceType });
  const bodySiteField = useConceptSearchField({ uuid: bodySiteConceptUuid, sourceType: bodySiteConceptSourceType });

  const [procedureConcept, setProcedureConcept] = useState<ConceptReference | null>(
    procedure?.procedureCoded?.uuid ? procedure.procedureCoded : null,
  );
  const [bodySiteConcept, setBodySiteConcept] = useState<ConceptReference | null>(
    procedure?.bodySite?.uuid ? procedure.bodySite : null,
  );
  const { searchResults: statusOptions } = useConceptSearch('', {
    uuid: statusConceptUuid,
    sourceType: statusConceptSourceType,
  });

  const { searchResults: durationUnitOptions } = useConceptSearch('', {
    uuid: durationUnitConceptUuid,
    sourceType: durationUnitConceptSourceType,
  });

  const [errorSaving, setErrorSaving] = useState(null);

  const handleSave = useCallback(async () => {
    setIsSubmittingForm(true);
    const procedureType = getValues('procedureType');
    const startDateTime = getValues('startDateTime');
    const endDateTime = getValues('endDateTime');
    const notes = getValues('notes');
    const duration = getValues('duration');
    const durationUnit = getValues('durationUnit');

    const estimatedStartDate = getValues('estimatedStartDate');
    const hasDuration = typeof duration === 'number' && !Number.isNaN(duration);

    const payload = {
      patient: patientUuid,
      procedureCoded: getValues('procedureCoded'),
      procedureType: procedureType,
      bodySite: getValues('bodySite') || null,
      startDateTime: startDateTime ? dayjs(startDateTime).format() : null,
      endDateTime: endDateTime ? dayjs(endDateTime).format() : null,
      status: getValues('status'),
      notes: notes,
      estimatedStartDate: estimatedStartDate || null,
      duration: hasDuration ? duration : null,
      durationUnit: hasDuration && durationUnit ? durationUnit : null,
    };

    try {
      if (procedure?.uuid) {
        await updateProcedure(procedure.uuid, payload);
      } else {
        await saveProcedure(payload);
      }
      await mutate();
      showSnackbar({
        kind: 'success',
        title: t('procedureSaved', 'Procedure saved'),
        subtitle: t('procedureNowVisible', 'It is now visible on the Procedures page'),
      });
      closeWorkspace();
    } catch (error) {
      setIsSubmittingForm(false);
      setErrorSaving(error);
    }
  }, [closeWorkspace, getValues, mutate, patientUuid, procedure?.uuid, t]);

  const onError = () => setIsSubmittingForm(false);

  return (
    <Form className={styles.form} onSubmit={handleSubmit(handleSave, onError)}>
      <div className={styles.formContainer}>
        <Stack gap={7}>
          <FormGroup legendText={<RequiredFieldLabel label={t('procedure', 'Procedure')} />}>
            <ConceptSearchField
              label={t('enterProcedure', 'Enter procedure')}
              placeholder={t('searchProcedures', 'Search procedures')}
              field={procedureField}
              selectedConcept={procedureConcept}
              onChange={(concept) => {
                setProcedureConcept(concept);
                setValue('procedureCoded', concept?.uuid ?? '');
              }}
            />
            {errors.procedureCoded && <p className={styles.errorMessage}>{errors.procedureCoded.message}</p>}
          </FormGroup>

          <FormGroup legendText={<RequiredFieldLabel label={t('procedureType', 'Procedure type')} />}>
            {isLoadingProcedureTypes ? (
              <InlineLoading className={styles.loader} description={t('loading', 'Loading') + '...'} />
            ) : (
              <ResponsiveWrapper>
                <ComboBox
                  id="procedureType"
                  titleText=""
                  placeholder={t('selectProcedureType', 'Select procedure type')}
                  items={procedureTypes}
                  itemToString={(item: ProcedureType) => item?.name ?? ''}
                  initialSelectedItem={procedureTypes.find((pt) => pt.uuid === getValues('procedureType')) ?? null}
                  onChange={({ selectedItem }: { selectedItem: ProcedureType | null }) =>
                    setValue('procedureType', selectedItem?.uuid ?? '')
                  }
                />
              </ResponsiveWrapper>
            )}
            {errors.procedureType && <p className={styles.errorMessage}>{errors.procedureType.message}</p>}
          </FormGroup>

          <FormGroup legendText={<RequiredFieldLabel label={t('bodySite', 'Body site')} />}>
            <ConceptSearchField
              label={t('enterBodySite', 'Enter body site')}
              placeholder={t('searchBodySites', 'Search body sites')}
              field={bodySiteField}
              selectedConcept={bodySiteConcept}
              onChange={(concept) => {
                setBodySiteConcept(concept);
                setValue('bodySite', concept?.uuid ?? '');
              }}
            />
            {errors.bodySite && <p className={styles.errorMessage}>{errors.bodySite.message}</p>}
          </FormGroup>
          <FormGroup legendText={t('isStartDateKnown', 'Is start date known?')}>
            <ContentSwitcher
              size="md"
              selectedIndex={isStartDateKnown ? 0 : 1}
              onChange={({ index }: { index: number }) => {
                const isKnown = index === 0;
                setIsStartDateKnown(isKnown);

                if (!isKnown) {
                  setValue('startDateTime', null);
                }

                setEstimatedYear('');
                setEstimatedMonth('');
              }}
            >
              <Switch name="yes">{t('yes', 'Yes')}</Switch>
              <Switch name="no">{t('no', 'No')}</Switch>
            </ContentSwitcher>
          </FormGroup>

          {isStartDateKnown && (
            <FormGroup legendText={<RequiredFieldLabel label={t('startDateAndTime', 'Start date and time')} />}>
              <Controller
                name="startDateTime"
                control={control}
                render={({ field, fieldState }) => (
                  <DateTimeField
                    idPrefix="startDateTime"
                    value={field.value}
                    onChange={field.onChange}
                    invalid={Boolean(fieldState.error?.message)}
                    invalidText={fieldState.error?.message}
                  />
                )}
              />
            </FormGroup>
          )}

          {!isStartDateKnown && (
            <FormGroup legendText={t('estimatedStartDate', 'Estimated start date')}>
              <div className={styles.twoColumnGroup}>
                <ResponsiveWrapper>
                  <ComboBox
                    id="estimatedYear"
                    titleText={<RequiredFieldLabel label={t('year', 'Year')} />}
                    placeholder={t('selectYear', 'Select year')}
                    items={yearOptions}
                    itemToString={(item: { id: string; label: string }) => item?.label ?? ''}
                    selectedItem={yearOptions.find((y) => y.id === estimatedYear) ?? null}
                    onChange={({ selectedItem }: { selectedItem: { id: string; label: string } | null }) =>
                      setEstimatedYear(selectedItem?.id ?? '')
                    }
                  />
                </ResponsiveWrapper>
                <ResponsiveWrapper>
                  <ComboBox
                    id="estimatedMonth"
                    titleText={t('monthOptional', 'Month (optional)')}
                    placeholder={t('selectMonth', 'Select month (optional)')}
                    items={monthOptions}
                    itemToString={(item: { id: string; label: string }) => item?.label ?? ''}
                    selectedItem={monthOptions.find((m) => m.id === estimatedMonth) ?? null}
                    onChange={({ selectedItem }: { selectedItem: { id: string; label: string } | null }) =>
                      setEstimatedMonth(selectedItem?.id ?? '')
                    }
                  />
                </ResponsiveWrapper>
              </div>
              {errors.startDateTime && <p className={styles.errorMessage}>{errors.startDateTime.message}</p>}
            </FormGroup>
          )}

          <FormGroup legendText={t('endDateAndTime', 'End date and time')}>
            <Controller
              name="endDateTime"
              control={control}
              render={({ field, fieldState }) => (
                <DateTimeField
                  idPrefix="endDateTime"
                  value={field.value}
                  onChange={field.onChange}
                  invalid={Boolean(fieldState.error?.message)}
                  invalidText={fieldState.error?.message}
                />
              )}
            />
          </FormGroup>

          <FormGroup legendText={t('procedureDuration', 'Procedure duration')}>
            <div className={styles.twoColumnGroup}>
              <Controller
                name="duration"
                control={control}
                render={({ field: { onChange, value, ref, name } }) => (
                  <ResponsiveWrapper>
                    <NumberInput
                      id="duration"
                      name={name}
                      ref={ref}
                      label={t('durationValue', 'Duration')}
                      placeholder={t('enterDuration', 'Enter duration')}
                      min={1}
                      hideSteppers
                      allowEmpty
                      value={value ?? ''}
                      onChange={(_event, { value: nextValue }: { value: number | string }) => {
                        if (nextValue == null || nextValue === '') {
                          onChange(null);
                          return;
                        }
                        const parsed = typeof nextValue === 'number' ? nextValue : Number(nextValue);
                        onChange(Number.isNaN(parsed) ? null : parsed);
                      }}
                    />
                  </ResponsiveWrapper>
                )}
              />
              <Controller
                name="durationUnit"
                control={control}
                render={({ field }) => (
                  <ResponsiveWrapper>
                    <ComboBox
                      id="durationUnit"
                      titleText={t('durationUnit', 'Duration unit')}
                      placeholder={t('selectDurationUnit', 'Select unit')}
                      items={durationUnitOptions}
                      itemToString={(item: ConceptReference) => item?.display ?? ''}
                      selectedItem={durationUnitOptions.find((option) => option.uuid === field.value) ?? null}
                      onChange={({ selectedItem }: { selectedItem: ConceptReference | null }) =>
                        field.onChange(selectedItem?.uuid ?? null)
                      }
                    />
                  </ResponsiveWrapper>
                )}
              />
            </div>
            {errors.duration && <p className={styles.errorMessage}>{errors.duration.message}</p>}
            {errors.durationUnit && <p className={styles.errorMessage}>{errors.durationUnit.message}</p>}
          </FormGroup>

          <FormGroup legendText={<RequiredFieldLabel label={t('status', 'Status')} />}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <ResponsiveWrapper>
                  <ComboBox
                    id="status"
                    titleText=""
                    placeholder={t('selectStatus', 'Select status')}
                    items={statusOptions}
                    itemToString={(item: ConceptReference) => item?.display ?? ''}
                    selectedItem={statusOptions.find((option) => option.uuid === field.value) ?? null}
                    onChange={({ selectedItem }: { selectedItem: ConceptReference | null }) =>
                      field.onChange(selectedItem?.uuid ?? null)
                    }
                  />
                </ResponsiveWrapper>
              )}
            />
            {errors.status && <p className={styles.errorMessage}>{errors.status.message}</p>}
          </FormGroup>

          <FormGroup legendText={t('notes', 'Notes')}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <ResponsiveWrapper>
                  <TextArea
                    {...field}
                    id="notes"
                    labelText=""
                    placeholder={t('enterNotes', 'Enter notes (optional)')}
                  />
                </ResponsiveWrapper>
              )}
            />
            {errors.notes && <p className={styles.errorMessage}>{errors.notes.message}</p>}
          </FormGroup>
        </Stack>
      </div>
      <div className={styles.submitButtons}>
        {errorSaving ? (
          <div className={styles.errorContainer}>
            <InlineNotification
              role="alert"
              kind="error"
              lowContrast
              title={t('errorSavingProcedure', 'Error saving procedure')}
              subtitle={errorSaving?.message}
            />
          </div>
        ) : null}
        <ButtonSet className={classNames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
          <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button className={styles.button} disabled={isSubmittingForm} kind="primary" type="submit">
            {isSubmittingForm ? (
              <InlineLoading className={styles.spinner} description={t('saving', 'Saving') + '...'} />
            ) : (
              <span>{t('saveAndClose', 'Save & close')}</span>
            )}
          </Button>
        </ButtonSet>
      </div>
    </Form>
  );
};

const RequiredFieldLabel = ({ label }: { label: string }) => {
  const { t } = useTranslation();
  return (
    <span>
      {label}
      <span title={t('required', 'Required')} className={styles.required}>
        *
      </span>
    </span>
  );
};

export default ProceduresFormComponent;
