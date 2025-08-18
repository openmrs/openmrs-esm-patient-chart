import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ButtonSet, Form, Layer, InlineLoading, InlineNotification, Stack } from '@carbon/react';
import classNames from 'classnames';
import { type Control, useForm } from 'react-hook-form';
import { type TFunction, useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  restBaseUrl,
  showSnackbar,
  useAbortController,
  useLayoutType,
  useConfig,
  useVisit,
  useSession,
  ExtensionSlot,
} from '@openmrs/esm-framework';
import {
  type DefaultPatientWorkspaceProps,
  getPatientChartStore,
  type Order,
  type OrderBasketItem,
  postOrders,
  useOrderBasket,
  usePatientOrders,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import { type ObservationValue } from '../types/encounter';
import { type ConfigObject } from '../config-schema';
import {
  createObservationPayload,
  isCoded,
  isNumeric,
  isPanel,
  isText,
  updateObservation,
  updateOrderResult,
  useCompletedLabResults,
  useCompletedLabResultsForOrders,
  useOrderConceptsByUuids,
  useOrderConceptByUuid,
} from './lab-results.resource';
import { createArrayLabResultsFormSchema, createLabResultsFormSchema } from './lab-results-schema.resource';
import { useMutatePatientOrders, useOrderEncounter } from '../api/api';
import ResultFormField from './lab-results-form-field.component';
import styles from './lab-results-form.scss';
import orderStyles from '../order-basket/order-basket.scss';

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
  patientUuid = order.patient.uuid,
}) => {
  const { t } = useTranslation();
  const abortController = useAbortController();
  const isTablet = useLayoutType() === 'tablet';
  const [orderList, setOrderList] = useState<Order[]>([order]);
  const { concept, isLoading: isLoadingConcepts } = useOrderConceptByUuid(order.concept.uuid);
  const { isLoading: isAnyConceptLoading, concepts: conceptList } = useOrderConceptsByUuids(
    orderList.map((o) => o.concept.uuid),
  );
  const [showEmptyFormErrorNotification, setShowEmptyFormErrorNotification] = useState(false);
  const schema = useMemo(() => createLabResultsFormSchema(concept), [concept]);
  const mergedSchema = useMemo(() => createArrayLabResultsFormSchema(conceptList), [conceptList]);
  const { completeLabResult, isLoading, mutate: mutateResults } = useCompletedLabResults(order);
  const { mutate } = useSWRConfig();
  const config = useConfig<ConfigObject>();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const { orders, clearOrders } = useOrderBasket();
  const [isSavingOrders, setIsSavingOrders] = useState(false);
  const [creatingEncounterError, setCreatingEncounterError] = useState('');
  const session = useSession();
  const { mutate: mutateOrders } = useMutatePatientOrders(patientUuid);
  const { mutate: mutateCurrentVisit } = useVisit(patientUuid);
  const [ordersWithErrors, setOrdersWithErrors] = useState<OrderBasketItem[]>([]);
  const { isLoading: isAnyResultLoading, completeLabResults: completeLabResultList } =
    useCompletedLabResultsForOrders(orderList);
  const {
    data: newOrders,
    error: error,
    isLoading: ordersLoading,
    isValidating,
  } = usePatientOrders(patientUuid, 'ACTIVE', null, null, null);
  const [savedOrderConceptList, setSavedOrderConceptList] = useState([]);
  const [existingOrderNumbers, setExistingOrderNumbers] = useState([]);
  const patientStore = getPatientChartStore();
  const [isOutSitePatientChart, setIsOutSitePatientChart] = useState(false);

  const mutateOrderData = useCallback(() => {
    mutate(
      (key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/order?patient=${order.patient.uuid}`),
      undefined,
      { revalidate: true },
    );
  }, [mutate, order.patient.uuid]);

  useEffect(() => {
    const storeUuid = patientStore.getState().patientUuid;
    if (!storeUuid) {
      patientStore.setState({ patientUuid: patientUuid });
      setIsOutSitePatientChart(true);
    }
  }, [patientUuid, patientStore]);

  useEffect(() => {
    if (savedOrderConceptList.length === 0 || !newOrders?.length) return;
    const filteredNewOrders = newOrders.filter(
      (o) => savedOrderConceptList.includes(o.concept.uuid) && !existingOrderNumbers.includes(o.orderNumber),
    );
    const updatedNewOrders = savedOrderConceptList.includes(order.concept.uuid)
      ? filteredNewOrders
      : [order, ...filteredNewOrders];

    setOrderList(updatedNewOrders);
  }, [newOrders, savedOrderConceptList, existingOrderNumbers, order]);

  const {
    visitRequired,
    isLoading: isLoadingEncounterUuid,
    encounterUuid,
    error: errorFetchingEncounterUuid,
    mutate: mutateEncounterUuid,
  } = useOrderEncounter(patientUuid, config.orderEncounterType);

  function showOrderSuccessToast(t: TFunction, patientOrderItems: OrderBasketItem[]) {
    const orderedString = patientOrderItems
      .filter((item) => ['NEW', 'RENEW'].includes(item.action))
      .map((item) => item.display)
      .join(', ');
    const updatedString = patientOrderItems
      .filter((item) => item.action === 'REVISE')
      .map((item) => item.display)
      .join(', ');
    const discontinuedString = patientOrderItems
      .filter((item) => item.action === 'DISCONTINUE')
      .map((item) => item.display)
      .join(', ');

    showSnackbar({
      isLowContrast: true,
      kind: 'success',
      title: t('orderCompleted', 'Placed orders'),
      subtitle:
        (orderedString && `${t('ordered', 'Placed order for')} ${orderedString}. `) +
        (updatedString && `${t('updated', 'Updated')} ${updatedString}. `) +
        (discontinuedString && `${t('discontinued', 'Discontinued')} ${discontinuedString}.`),
    });
  }

  const handleCancel = useCallback(() => {
    clearOrders();
  }, [clearOrders]);

  const handleSave = useCallback(async () => {
    const abortController = new AbortController();
    const orderNumbers = newOrders.filter((o) => o.orderNumber != order.orderNumber).map((o) => o.orderNumber);
    setExistingOrderNumbers(orderNumbers);
    setCreatingEncounterError('');
    let orderEncounterUuid = encounterUuid ? encounterUuid : order.encounter.uuid;

    setIsSavingOrders(true);

    const erroredItems = await postOrders(patientUuid, orderEncounterUuid, abortController);
    const conceptUuids = orders.map((order) => order['testType']['conceptUuid']);
    setSavedOrderConceptList(conceptUuids);
    clearOrders({ exceptThoseMatching: (item) => erroredItems.map((e) => e.display).includes(item.display) });
    // Only revalidate current visit since orders create new encounters
    mutateCurrentVisit();
    await mutateOrders();
    if (erroredItems.length == 0) {
      showOrderSuccessToast(t, orders);
    } else {
      setOrdersWithErrors(erroredItems);
    }
    setIsSavingOrders(false);
    if (isOutSitePatientChart) {
      patientStore.setState({});
      setIsOutSitePatientChart(false);
    }
    return () => abortController.abort();
  }, [
    clearOrders,
    encounterUuid,
    mutateOrders,
    mutateCurrentVisit,
    orders,
    patientUuid,
    t,
    order.encounter.uuid,
    isOutSitePatientChart,
    newOrders,
    order.orderNumber,
    patientStore,
  ]);

  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    setValue,
    handleSubmit,
  } = useForm<Record<string, ObservationValue>>({
    defaultValues: {} as Record<string, ObservationValue>,
    resolver: zodResolver(mergedSchema),
    mode: 'all',
  });

  useEffect(() => {
    orderList.forEach((order, index) => {
      const completeLabResult = completeLabResultList.find((r) => r.concept.uuid === order.concept.uuid);
      const concept = conceptList.find((c) => c.uuid === order.concept.uuid);
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
  }, [conceptList, completeLabResultList, orderList, setValue]);

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
    orderList.forEach(async (order, index) => {
      const completeLabResult = completeLabResultList.find((r) => r.concept.uuid === order.concept.uuid);
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
      const obsPayload = createObservationPayload(
        conceptList.find((c) => c.uuid === order.concept.uuid),
        order,
        formValues,
        'FINAL',
      );
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
    });
  };

  return (
    <Form className={styles.form} onSubmit={handleSubmit(saveLabResults)}>
      <Layer level={isTablet ? 1 : 0}>
        <div className={styles.grid}>
          {conceptList?.length > 0 && (
            <Stack gap={5}>
              {!isAnyResultLoading ? (
                conceptList.map((c) => (
                  <ResultFormField
                    defaultValue={completeLabResultList.find((r) => r.concept.uuid === c.uuid)}
                    concept={c}
                    control={control as unknown as Control<Record<string, unknown>>}
                  />
                ))
              ) : (
                <InlineLoading description={t('loadingInitialValues', 'Loading initial values') + '...'} />
              )}
              <div className={orderStyles.orderBasketContainer}>
                <ExtensionSlot
                  className={classNames(orderStyles.orderBasketSlot, {
                    [orderStyles.orderBasketSlotTablet]: isTablet,
                  })}
                  name="result-order-basket-slot"
                />
              </div>
              {orders?.length > 0 && (
                <div className={orderStyles.orderBasketContainer}>
                  {(creatingEncounterError || errorFetchingEncounterUuid) && (
                    <InlineNotification
                      kind="error"
                      title={t('tryReopeningTheWorkspaceAgain', 'Please try launching the workspace again')}
                      subtitle={creatingEncounterError}
                      lowContrast={true}
                      className={styles.inlineNotification}
                    />
                  )}
                  {ordersWithErrors.map((order) => (
                    <InlineNotification
                      lowContrast
                      kind="error"
                      title={t('saveDrugOrderFailed', 'Error ordering {{orderName}}', { orderName: order.display })}
                      subtitle={order.extractedOrderError?.fieldErrors?.join(', ')}
                      className={styles.inlineNotification}
                    />
                  ))}
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
                        isSavingOrders || !orders?.length || orders?.some(({ isOrderIncomplete }) => isOrderIncomplete)
                      }
                    >
                      {isSavingOrders ? (
                        <InlineLoading description={t('saving', 'Saving') + '...'} />
                      ) : (
                        <span>{t('saveOrder', 'Save order')}</span>
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
  );
};

export default LabResultsForm;
