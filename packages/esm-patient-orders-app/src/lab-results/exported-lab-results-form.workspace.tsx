import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ButtonSet, Form, Layer, InlineLoading, InlineNotification, Stack } from '@carbon/react';
import classNames from 'classnames';
import { type Control, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ExtensionSlot,
  restBaseUrl,
  showSnackbar,
  useAbortController,
  useLayoutType,
  Workspace2,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { useOrderBasket, type Order } from '@openmrs/esm-patient-common-lib';
import { type ObservationValue } from '../types/encounter';
import {
  createCompositeObservationPayload,
  isCoded,
  isNumeric,
  isPanel,
  isText,
  updateObservation,
  updateOrderResult,
  useCompletedLabResultsArray,
  useOrderConceptsByUuids,
} from './lab-results.resource';
import { createLabResultsFormCompositeSchema } from './lab-results-schema.resource';
import ResultFormField from './lab-results-form-field.component';
import styles from './lab-results-form.scss';
import orderStyles from '../order-basket/order-basket.scss';

export interface LabResultsFormProps {
  patient: fhir.Patient;
  order: Order;
  /** Callback to refresh lab orders in the Laboratory app after results are saved.
   * This ensures the orders list stays in sync across the different tabs in the Laboratory app.
   * @see https://github.com/openmrs/openmrs-esm-laboratory-app/pull/117 */
  invalidateLabOrders?: () => void;
}

interface OrderBasketSlotProps {
  patient: fhir.Patient;
}

const ExportedLabResultsForm: React.FC<Workspace2DefinitionProps<LabResultsFormProps, {}, {}>> = ({
  workspaceProps: { patient, order, invalidateLabOrders },
  closeWorkspace,
}) => {
  const { t } = useTranslation();
  const abortController = useAbortController();
  const isTablet = useLayoutType() === 'tablet';
  const [orderConceptUuids, setOrderConceptUuids] = useState([order.concept.uuid]);
  const { isLoading: isLoadingResultConcepts, concepts: conceptArray } = useOrderConceptsByUuids(orderConceptUuids);
  const [showEmptyFormErrorNotification, setShowEmptyFormErrorNotification] = useState(false);
  const compositeSchema = useMemo(() => createLabResultsFormCompositeSchema(conceptArray), [conceptArray]);
  const { mutate } = useSWRConfig();
  const { orders, clearOrders } = useOrderBasket(patient);
  const [isSavingOrders, setIsSavingOrders] = useState(false);
  const { isLoading, completeLabResults, mutate: mutateResults } = useCompletedLabResultsArray(order);

  const mutateOrderData = useCallback(() => {
    mutate(
      (key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/order?patient=${order.patient.uuid}`),
      undefined,
      { revalidate: true },
    );
  }, [mutate, order.patient.uuid]);

  const handleCancel = useCallback(() => {
    clearOrders();
  }, [clearOrders]);

  const handleSave = useCallback(() => {
    const newConceptUuids = orders.map((order) => order['testType']['conceptUuid']);
    setOrderConceptUuids([order.concept.uuid, ...newConceptUuids]);
    clearOrders();
  }, [clearOrders, orders, order.concept.uuid]);

  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    setValue,
    handleSubmit,
  } = useForm<Record<string, ObservationValue>>({
    defaultValues: {} as Record<string, ObservationValue>,
    resolver: zodResolver(compositeSchema),
    mode: 'all',
  });
  useEffect(() => {
    if (Array.isArray(completeLabResults) && completeLabResults.length > 1) {
      const conceptUuids = completeLabResults.map((r) => r.concept.uuid);
      setOrderConceptUuids(conceptUuids);
    }
  }, [completeLabResults]);

  const extensionProps = {
    patient,
  } satisfies OrderBasketSlotProps;

  useEffect(() => {
    conceptArray.forEach((concept, index) => {
      const completeLabResult = completeLabResults.find((r) => r.concept.uuid === concept.uuid);
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
    });
  }, [conceptArray, completeLabResults, order?.fulfillerStatus, setValue]);

  if (isLoadingResultConcepts) {
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
        const completeLabResult = completeLabResults.find((r) => r.concept.uuid === conceptUuid);
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
        closeWorkspace({ discardUnsavedChanges: true });
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
    const obsPayload = createCompositeObservationPayload(conceptArray, order, formValues, 'FINAL');
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

      closeWorkspace({ discardUnsavedChanges: true });
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
    <Workspace2 title={t('enterTestResults', 'Enter test results')} hasUnsavedChanges={isDirty}>
      <Form className={styles.form} onSubmit={handleSubmit(saveLabResults)}>
        <Layer level={isTablet ? 1 : 0}>
          <div className={styles.grid}>
            {conceptArray?.length > 0 && (
              <Stack gap={5}>
                {!isLoading ? (
                  conceptArray.map((c) => (
                    <ResultFormField
                      defaultValue={completeLabResults.find((r) => r.concept.uuid === c.uuid)}
                      concept={c}
                      control={control as unknown as Control<Record<string, unknown>>}
                    />
                  ))
                ) : (
                  <InlineLoading description={t('loadingInitialValues', 'Loading initial values') + '...'} />
                )}
                {order.fulfillerStatus !== 'COMPLETED' && (
                  <div className={orderStyles.orderBasketContainer}>
                    <div className={styles.heading}>
                      <span>{t('addOrderTests', 'Add Tests to this order')}</span>
                    </div>
                    <ExtensionSlot
                      className={classNames(orderStyles.orderBasketSlot, {
                        [orderStyles.orderBasketSlotTablet]: isTablet,
                      })}
                      name="result-order-basket-slot"
                      state={extensionProps}
                    />
                  </div>
                )}

                {orders?.length > 0 && (
                  <div className={orderStyles.orderBasketContainer}>
                    <ButtonSet className={styles.buttonSet}>
                      <Button size="sm" className={styles.actionButton} kind="secondary" onClick={handleCancel}>
                        {t('cancelOrder', 'Cancel order')}
                      </Button>
                      <Button
                        className={styles.actionButton}
                        kind="primary"
                        onClick={handleSave}
                        size="sm"
                        disabled={
                          isSavingOrders ||
                          !orders?.length ||
                          orders?.some(({ isOrderIncomplete }) => isOrderIncomplete)
                        }
                      >
                        {isSavingOrders ? (
                          <InlineLoading description={t('saving', 'Saving') + '...'} />
                        ) : (
                          <span>{t('saveTests', 'Save Tests')}</span>
                        )}
                      </Button>
                    </ButtonSet>
                  </div>
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
    </Workspace2>
  );
};

export default ExportedLabResultsForm;
