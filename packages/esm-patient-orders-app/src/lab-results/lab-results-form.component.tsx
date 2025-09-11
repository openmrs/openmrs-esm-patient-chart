import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ButtonSet, Form, Layer, InlineLoading, InlineNotification, Stack } from '@carbon/react';
import classNames from 'classnames';
import { type Control, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  restBaseUrl,
  showSnackbar,
  useAbortController,
  useConfig,
  useLayoutType,
  showModal,
} from '@openmrs/esm-framework';
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
import { createLabResultsFormSchema } from './lab-results-schema.resource';

import ResultFormField from './lab-results-form-field.component';
import styles from './lab-results-form.scss';
import { type ConfigObject } from '../config-schema';

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
  const { enableReviewingLabResultsBeforeApproval } = useConfig<ConfigObject>();
  const abortController = useAbortController();
  const isTablet = useLayoutType() === 'tablet';
  const { concept, isLoading: isLoadingConcepts } = useOrderConceptByUuid(order.concept.uuid);
  const [showEmptyFormErrorNotification, setShowEmptyFormErrorNotification] = useState(false);
  const schema = useMemo(() => createLabResultsFormSchema(concept), [concept]);
  const { completeLabResult, isLoading, mutate: mutateResults } = useCompletedLabResults(order);
  const { mutate } = useSWRConfig();

  const mutateOrderData = useCallback(() => {
    mutate(
      (key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/order?patient=${order.patient.uuid}`),
      undefined,
      { revalidate: true },
    );
  }, [mutate, order.patient.uuid]);

  const launchApprovalModal = useCallback(() => {
    const dispose = showModal('approval-lab-results-modal', {
      closeModal: () => dispose(),
      order,
    });
  }, [order]);

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
    // Determine which statuses to check based on the config
    const validStatuses = enableReviewingLabResultsBeforeApproval ? ['COMPLETED', 'ON_HOLD'] : ['COMPLETED'];

    if (concept && completeLabResult && validStatuses.includes(order?.fulfillerStatus)) {
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
  }, [concept, completeLabResult, order, setValue, enableReviewingLabResultsBeforeApproval]);

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
    if (enableReviewingLabResultsBeforeApproval) {
      // New workflow with approval process
      if (order.fulfillerStatus === 'COMPLETED' || order.fulfillerStatus === 'ON_HOLD') {
        try {
          const updateTasks = Object.entries(formValues).map(([conceptUuid, value]) => {
            const obs =
              completeLabResult?.groupMembers?.find((v) => v.concept.uuid === conceptUuid) ?? completeLabResult;
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
            const errorMessage = 'Could not save obs with concept uuids ' + failedObsconceptUuids.join(', ');
            showNotification('error', errorMessage);
            return;
          }

          const resultsStatusPayload = {
            fulfillerStatus: 'COMPLETED',
            fulfillerComment: 'Test Results Entered',
          };

          await updateOrderResult(order.uuid, order.encounter.uuid, null, resultsStatusPayload, null, abortController);

          await Promise.all([mutateResults(), mutateOrderData()]);

          if (invalidateLabOrders) {
            invalidateLabOrders();
          }
          launchApprovalModal();

          closeWorkspaceWithSavedChanges();
          showNotification(
            'success',
            t('successfullySavedLabResults', 'Lab results for {{orderNumber}} have been successfully updated', {
              orderNumber: order?.orderNumber,
            }),
          );
        } catch (err) {
          showNotification('error', err?.message || 'An error occurred while updating lab results');
        } finally {
          setShowEmptyFormErrorNotification(false);
        }
        return;
      }

      try {
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
          fulfillerStatus: 'ON_HOLD',
          fulfillerComment: 'Test Results Modified, pending approval',
        };

        await updateOrderResult(
          order.uuid,
          order.encounter.uuid,
          obsPayload,
          resultsStatusPayload,
          orderDiscontinuationPayload,
          abortController,
        );

        await Promise.all([mutateOrderData(), mutateResults()]);

        if (invalidateLabOrders) {
          invalidateLabOrders();
        }

        closeWorkspaceWithSavedChanges();

        showNotification(
          'success',
          t('successfullySavedLabResults', 'Lab results for {{orderNumber}} have been successfully updated', {
            orderNumber: order?.orderNumber,
          }),
        );
      } catch (err) {
        showNotification('error', err?.message || 'An error occurred while saving lab results');
      } finally {
        setShowEmptyFormErrorNotification(false);
      }
    } else {
      // Original workflow without approval process
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

      // Handle Creation logic (original workflow - directly to COMPLETED)
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
