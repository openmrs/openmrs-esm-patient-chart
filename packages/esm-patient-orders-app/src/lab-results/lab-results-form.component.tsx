import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSet, Form, InlineLoading, InlineNotification, Stack } from '@carbon/react';
import { type Control, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import { zodResolver } from '@hookform/resolvers/zod';
import { restBaseUrl, showSnackbar, useAbortController, useLayoutType } from '@openmrs/esm-framework';
import { type DefaultPatientWorkspaceProps, type Order } from '@openmrs/esm-patient-common-lib';
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
import { useLabResultsFormSchema } from './useLabResultsFormSchema';
import ResultFormField from './lab-results-form-field.component';
import styles from './lab-results-form.scss';

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
  const schema = useLabResultsFormSchema(order.concept.uuid);
  const { completeLabResult, isLoading, mutate: mutateResults } = useCompletedLabResults(order);
  const { mutate } = useSWRConfig();

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
  } = useForm<Record<string, ObservationValue>>({
    defaultValues: {} as Record<string, ObservationValue>,
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
  }, [concept, completeLabResult, order, setValue]);

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

  const saveLabResults = async (formValues: Record<string, unknown>) => {
    const isEmptyForm = Object.values(formValues).every(
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

    // Handle update operation for completed lab order results
    if (order.fulfillerStatus === 'COMPLETED') {
      const updateTasks = Object.entries(formValues).map(([conceptUuid, value]) => {
        const obs = completeLabResult?.groupMembers?.find((v) => v.concept.uuid === conceptUuid) ?? completeLabResult;
        return updateObservation(obs?.uuid, { value });
      });
      const updateResults = await Promise.allSettled(updateTasks);
      const failedObsconceptUuids = updateResults.reduce((prev, curr, index) => {
        if (curr.status === 'rejected') {
          return [...prev, Object.keys(formValues).at(index)];
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
    const obsPayload = createObservationPayload(concept, order, formValues, 'FINAL');
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
      <div className={styles.grid}>
        {concept.setMembers.length > 0 && <p className={styles.heading}>{concept.display}</p>}
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
