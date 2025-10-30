import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  ButtonSet,
  Form,
  Layer,
  InlineLoading,
  InlineNotification,
  Stack,
  TimePicker,
  TimePickerSelect,
  SelectItem,
} from '@carbon/react';
import classNames from 'classnames';
import { type Control, Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  OpenmrsDatePicker,
  ResponsiveWrapper,
  restBaseUrl,
  showSnackbar,
  useAbortController,
  useFeatureFlag,
  useLayoutType,
} from '@openmrs/esm-framework';
import {
  type amPm,
  convertTime12to24,
  type DefaultPatientWorkspaceProps,
  type Order,
} from '@openmrs/esm-patient-common-lib';
import { type ObservationValue } from '../types/encounter';
import {
  createObservationPayload,
  isCoded,
  isNumeric,
  isPanel,
  isText,
  updateObservation,
  updateOrderResult,
  useCompletedLabResults,
  useOrderConceptByUuid,
} from './lab-results.resource';
import { createLabResultsFormSchema } from './lab-results-schema.resource';

import ResultFormField from './lab-results-form-field.component';
import styles from './lab-results-form.scss';
import { z } from 'zod';
import { format, isBefore, isFuture, set } from 'date-fns';

export interface LabResultsFormProps extends DefaultPatientWorkspaceProps {
  order: Order;
  invalidateLabOrders?: () => void;
}

const LabResultsForm: React.FC<LabResultsFormProps> = ({
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  order,
  promptBeforeClosing,
  /* Callback to refresh lab orders in the Laboratory app after results are saved.
   * This ensures the orders list stays in sync across the different tabs in the Laboratory app.
   * @see https://github.com/openmrs/openmrs-esm-laboratory-app/pull/117
   */
  invalidateLabOrders,
}) => {
  const { t } = useTranslation();
  const abortController = useAbortController();
  const isTablet = useLayoutType() === 'tablet';
  const { concept, isLoading: isLoadingConcepts } = useOrderConceptByUuid(order.concept.uuid);
  const [showEmptyFormErrorNotification, setShowEmptyFormErrorNotification] = useState(false);
  const labResultsFormSchema = useMemo(() => createLabResultsFormSchema(concept), [concept]);
  const { completeLabResult, isLoading, mutate: mutateResults } = useCompletedLabResults(order);
  const { mutate } = useSWRConfig();
  const isRdeEnabled = useFeatureFlag('rde');

  const rdeFieldsSchema = z.object({
    retrospectiveDate: z.date().optional(),
    retrospectiveTime: z.string().optional(),
    retrospectiveTimeFormat: z.string().optional(),
  });
  type LabResultsFormSchemaType = Record<string, ObservationValue>;
  type RdeFieldsSchemaType = z.infer<typeof rdeFieldsSchema>;
  type SchemaType = LabResultsFormSchemaType & RdeFieldsSchemaType;

  const schema = useMemo(() => {
    if (isRdeEnabled) {
      return labResultsFormSchema.merge(rdeFieldsSchema).superRefine((data, ctx) => {
        if (isRdeEnabled) {
          if (data.retrospectiveDate) {
            if (!data.retrospectiveTime) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['retrospectiveTime'],
                message: t('timeIsRequired', 'Time is required'),
              });
            }

            if (data.retrospectiveTime) {
              const timeValue = data.retrospectiveTime;
              const pattern = /^(0[1-9]|1[0-2]):([0-5][0-9])$/;
              if (!pattern.test(timeValue)) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  path: ['retrospectiveTime'],
                  message: t(
                    'invalidTimeFormatMessage',
                    'Please enter a valid time in 12 HR format HH:MM (e.g., 02:30).',
                  ),
                });
              }
            }

            if (!data.retrospectiveTimeFormat) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['retrospectiveTimeFormat'],
                message: t('retrospectiveTimeFormatRequired', 'Time format (AM/PM) is required'),
              });
            }
          }
        }
      });
    } else {
      return labResultsFormSchema;
    }
  }, [isRdeEnabled, labResultsFormSchema, rdeFieldsSchema, t]);

  const mutateOrderData = useCallback(() => {
    mutate(
      (key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/order?patient=${order.patient.uuid}`),
      undefined,
      { revalidate: true },
    );
  }, [mutate, order.patient.uuid]);

  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    setValue,
    handleSubmit,
    clearErrors,
    setError,
  } = useForm<SchemaType>({
    defaultValues: {},
    resolver: zodResolver(schema),
    mode: 'all',
  });

  useEffect(() => {
    if (concept && completeLabResult && order?.fulfillerStatus === 'COMPLETED') {
      if (isCoded(concept) && typeof completeLabResult?.value === 'object' && completeLabResult?.value?.uuid) {
        setValue(concept.uuid, completeLabResult.value.uuid);
      } else if (isNumeric(concept) && completeLabResult?.value) {
        setValue(concept.uuid, parseFloat(completeLabResult.value as string));
      } else if (isText(concept) && completeLabResult?.value) {
        setValue(concept.uuid, completeLabResult?.value);
      } else if (isPanel(concept)) {
        concept.setMembers.forEach((member) => {
          const obs = completeLabResult.groupMembers.find((v) => v.concept.uuid === member.uuid);
          let value: ObservationValue;
          if (isCoded(member)) {
            value = typeof obs?.value === 'object' ? obs.value.uuid : obs?.value;
          } else if (isNumeric(member)) {
            value = obs?.value ? parseFloat(obs.value as string) : undefined;
          } else if (isText(member)) {
            value = obs?.value;
          }
          if (value) setValue(member.uuid, value);
        });
      }
    }

    if (completeLabResult && order?.fulfillerStatus === 'COMPLETED' && isRdeEnabled) {
      const retrospectiveDate = new Date(completeLabResult.obsDatetime);
      setValue('retrospectiveDate', retrospectiveDate);
      const retrospectiveTime = format(retrospectiveDate, 'hh:mm');
      const retrospectiveTimeFormat = format(retrospectiveDate, 'a');
      setValue('retrospectiveTime', retrospectiveTime);
      setValue('retrospectiveTimeFormat', retrospectiveTimeFormat);
    }
  }, [concept, completeLabResult, order, setValue, isRdeEnabled]);

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  if (isLoadingConcepts) {
    return (
      <div className={styles.loaderContainer}>
        <InlineLoading
          className={styles.loader}
          description={t('loadingTestDetails', 'Loading test details') + '...'}
          iconDescription={t('loading', 'Loading')}
          status="active"
        />
      </div>
    );
  }

  const saveLabResults: SubmitHandler<SchemaType> = async (formValues) => {
    // Remove RDE-specific keys before checking if form is empty
    const rdeKeys = ['retrospectiveDate', 'retrospectiveTime', 'retrospectiveTimeFormat'];
    const labResultsOnly = Object.fromEntries(Object.entries(formValues).filter(([key]) => !rdeKeys.includes(key)));

    const isEmptyForm = Object.values(labResultsOnly).every(
      (value) => value === '' || value === null || value === undefined,
    );
    if (isEmptyForm) {
      setShowEmptyFormErrorNotification(true);
      return;
    }

    const showNotification = (kind: 'error' | 'success', message: string) => {
      showSnackbar({
        title:
          kind === 'success'
            ? t('saveLabResults', 'Save lab results')
            : t('errorSavingLabResults', 'Error saving lab results'),
        kind: kind,
        subtitle: message,
      });
    };

    let rdeDate: Date | undefined = new Date();

    if (formValues.retrospectiveDate || formValues.retrospectiveTime || formValues.retrospectiveTimeFormat) {
      let [hour, minute] = convertTime12to24(formValues.retrospectiveTime, formValues.retrospectiveTimeFormat as amPm);
      rdeDate = set(formValues.retrospectiveDate, {
        hours: hour,
        minutes: minute,
        seconds: 0,
        milliseconds: 0,
      });
    }

    if (isBefore(rdeDate, new Date(order.dateActivated))) {
      setError('retrospectiveTime', {
        type: 'manual',
        message: t('timeCannotBeBeforeOrderDate', 'time cannot be before {{time}}', {
          time: format(order.dateActivated, 'hh:mm a'),
        }),
      });
      return;
    }

    if (isFuture(rdeDate)) {
      setError('retrospectiveTime', {
        type: 'manual',
        message: t('timeCannotBeInTheFuture', 'time cannot be in the future'),
      });
      return;
    }

    // Handle update operation for completed lab order results
    if (order.fulfillerStatus === 'COMPLETED') {
      const updateTasks = Object.entries(labResultsOnly).map(([conceptUuid, value]) => {
        const obs = completeLabResult?.groupMembers?.find((v) => v.concept.uuid === conceptUuid) ?? completeLabResult;
        return updateObservation(obs?.uuid, { value, obsDatetime: rdeDate.toISOString() });
      });
      const updateResults = await Promise.allSettled(updateTasks);
      const failedObsconceptUuids = updateResults.reduce((prev, curr, index) => {
        if (curr.status === 'rejected') {
          return [...prev, Object.keys(labResultsOnly).at(index)];
        }
        return prev;
      }, []);

      if (failedObsconceptUuids.length) {
        showNotification('error', 'Could not save obs with concept uuids ' + failedObsconceptUuids.join(', '));
      } else {
        closeWorkspaceWithSavedChanges();
        showNotification(
          'success',
          t('successfullySavedLabResults', 'Lab results for {{orderNumber}} have been successfully updated', {
            orderNumber: order?.orderNumber,
          }),
        );
      }
      mutateResults();
      return setShowEmptyFormErrorNotification(false);
    }

    // Handle Creation logic

    // Set the observation status to 'FINAL' as we're not capturing it in the form
    const obsPayload = createObservationPayload(concept, order, formValues, 'FINAL', rdeDate.toISOString());
    const orderDiscontinuationPayload = {
      previousOrder: order.uuid,
      type: 'testorder',
      action: 'DISCONTINUE',
      careSetting: order.careSetting.uuid,
      encounter: order.encounter.uuid,
      patient: order.patient.uuid,
      concept: order.concept.uuid,
      orderer: order.orderer,
    };
    const resultsStatusPayload = {
      fulfillerStatus: 'COMPLETED',
      fulfillerComment: 'Test Results Entered',
    };

    try {
      await updateOrderResult(
        order.uuid,
        order.encounter.uuid,
        obsPayload,
        resultsStatusPayload,
        orderDiscontinuationPayload,
        abortController,
      );

      closeWorkspaceWithSavedChanges();
      mutateOrderData();
      mutateResults();
      invalidateLabOrders?.();

      showNotification(
        'success',
        t('successfullySavedLabResults', 'Lab results for {{orderNumber}} have been successfully updated', {
          orderNumber: order?.orderNumber,
        }),
      );
    } catch (err) {
      showNotification('error', err?.message);
    } finally {
      setShowEmptyFormErrorNotification(false);
    }
  };

  return (
    <Form className={styles.form} onSubmit={handleSubmit(saveLabResults)}>
      <Layer level={isTablet ? 1 : 0}>
        <div className={styles.grid}>
          {concept && (
            <Stack gap={5}>
              {!isLoading ? (
                <ResultFormField
                  defaultValue={completeLabResult}
                  concept={concept}
                  control={control as unknown as Control<Record<string, unknown>>}
                />
              ) : (
                <InlineLoading description={t('loadingInitialValues', 'Loading initial values') + '...'} />
              )}
            </Stack>
          )}
          {showEmptyFormErrorNotification && (
            <InlineNotification
              className={styles.emptyFormError}
              lowContrast
              title={t('error', 'Error')}
              subtitle={t('pleaseFillField', 'Please fill at least one field') + '.'}
            />
          )}
        </div>
        {isRdeEnabled && (
          <div className={styles.pickerWrapper}>
            <Controller
              name={'retrospectiveDate'}
              control={control}
              render={({ field, fieldState }) => (
                <ResponsiveWrapper>
                  <OpenmrsDatePicker
                    {...field}
                    id={'retrospective-date-picker-input'}
                    labelText={t('date', 'Date')}
                    invalid={Boolean(fieldState?.error?.message)}
                    invalidText={fieldState?.error?.message}
                    maxDate={new Date()}
                    minDate={new Date(order?.dateActivated)}
                    className={styles.datePicker}
                  />
                </ResponsiveWrapper>
              )}
            />
            <ResponsiveWrapper>
              <Controller
                name={'retrospectiveTime'}
                control={control}
                render={({ field: { onChange, value, onBlur } }) => (
                  <div className={styles.timePickerWrapper}>
                    <TimePicker
                      id={'retrospective-time-picker-input'}
                      labelText={t('time', 'Time')}
                      onBlur={onBlur}
                      onChange={(event) => onChange(event.target.value)}
                      value={value}
                      className={styles.timePicker}
                      invalid={Boolean(errors.retrospectiveTime)}
                      invalidText={errors.retrospectiveTime?.message}
                      onFocus={() => clearErrors('retrospectiveTime')}
                    >
                      <Controller
                        name={'retrospectiveTimeFormat'}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <TimePickerSelect
                            aria-label={t('timeFormat ', 'Time Format')}
                            id={`am-pm-input`}
                            onChange={(event) => onChange(event.target.value)}
                            value={value}
                          >
                            <SelectItem value="" text="" />
                            <SelectItem value="AM" text={t('AM', 'AM')} />
                            <SelectItem value="PM" text={t('PM', 'PM')} />
                          </TimePickerSelect>
                        )}
                      />
                    </TimePicker>
                  </div>
                )}
              />
            </ResponsiveWrapper>
          </div>
        )}
      </Layer>

      <ButtonSet
        className={classNames({
          [styles.tablet]: isTablet,
          [styles.desktop]: !isTablet,
        })}
      >
        <Button className={styles.button} kind="secondary" disabled={isSubmitting} onClick={() => closeWorkspace()}>
          {t('discard', 'Discard')}
        </Button>
        <Button
          className={styles.button}
          kind="primary"
          disabled={isSubmitting || Object.keys(errors).length > 0}
          type="submit"
        >
          {isSubmitting ? (
            <InlineLoading description={t('saving', 'Saving') + '...'} />
          ) : (
            t('saveAndClose', 'Save and close')
          )}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default LabResultsForm;
