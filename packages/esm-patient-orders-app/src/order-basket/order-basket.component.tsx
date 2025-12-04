import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, InlineLoading, InlineNotification } from '@carbon/react';
import { useSWRConfig } from 'swr';
import {
  ExtensionSlot,
  useConfig,
  useLayoutType,
  useSession,
  type Visit,
  Workspace2,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import {
  invalidateVisitAndEncounterData,
  type OrderBasketExtensionProps,
  type OrderBasketItem,
  postOrders,
  postOrdersOnNewEncounter,
  showOrderSuccessToast,
  useMutatePatientOrders,
  useOrderBasket,
} from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../config-schema';
import { useOrderEncounter } from '../api/api';
import GeneralOrderPanel from './general-order-type/general-order-panel.component';
import styles from './order-basket.scss';

interface OrderBasketProps {
  patientUuid: string;
  patient: fhir.Patient;
  visitContext: Visit;
  mutateVisitContext: () => void;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
  orderBasketExtensionProps: OrderBasketExtensionProps;
}

const OrderBasket: React.FC<OrderBasketProps> = ({
  patientUuid,
  patient,
  visitContext,
  mutateVisitContext,
  closeWorkspace,
  orderBasketExtensionProps,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const config = useConfig<ConfigObject>();
  const session = useSession();
  const { orders, clearOrders } = useOrderBasket(patient);
  const [ordersWithErrors, setOrdersWithErrors] = useState<OrderBasketItem[]>([]);
  const {
    visitRequired,
    isLoading: isLoadingEncounterUuid,
    encounterUuid,
    error: errorFetchingEncounterUuid,
    mutate: mutateEncounterUuid,
  } = useOrderEncounter(patientUuid, visitContext, mutateVisitContext, config.orderEncounterType);
  const [isSavingOrders, setIsSavingOrders] = useState(false);
  const [creatingEncounterError, setCreatingEncounterError] = useState('');
  const { mutate: mutateOrders } = useMutatePatientOrders(patientUuid);
  const { mutate } = useSWRConfig();

  const handleSave = useCallback(async () => {
    const abortController = new AbortController();
    setCreatingEncounterError('');
    let orderEncounterUuid = encounterUuid;
    setIsSavingOrders(true);
    // If there's no encounter present, create an encounter along with the orders.
    if (!orderEncounterUuid) {
      try {
        await postOrdersOnNewEncounter(
          patientUuid,
          config?.orderEncounterType,
          visitRequired ? visitContext : null,
          session?.sessionLocation?.uuid,
          abortController,
        );
        await closeWorkspace({ discardUnsavedChanges: true });
        mutateEncounterUuid();
        // Only revalidate current visit since orders create new encounters
        mutateVisitContext?.();
        invalidateVisitAndEncounterData(mutate, patientUuid);
        clearOrders();
        await mutateOrders();

        /* Translation keys used by showOrderSuccessToast:
         * t('discontinued', 'Discontinued')
         * t('orderDiscontinued', 'Order discontinued')
         * t('orderedFor', 'Placed order for')
         * t('orderPlaced', 'Order placed')
         * t('ordersCompleted', 'Orders completed')
         * t('ordersDiscontinued', 'Orders discontinued')
         * t('ordersPlaced', 'Orders placed')
         * t('ordersUpdated', 'Orders updated')
         * t('orderUpdated', 'Order updated')
         * t('updated', 'Updated')
         */
        showOrderSuccessToast('@openmrs/esm-patient-orders-app', orders);
      } catch (e) {
        console.error(e);
        setCreatingEncounterError(
          e.responseBody?.error?.message ||
            t('tryReopeningTheWorkspaceAgain', 'Please try launching the workspace again'),
        );
      }
    } else {
      const erroredItems = await postOrders(patientUuid, orderEncounterUuid, abortController);
      clearOrders({ exceptThoseMatching: (item) => erroredItems.map((e) => e.display).includes(item.display) });
      // Only revalidate current visit since orders create new encounters
      mutateVisitContext?.();
      await mutateOrders();
      invalidateVisitAndEncounterData(mutate, patientUuid);

      if (erroredItems.length == 0) {
        await closeWorkspace({ discardUnsavedChanges: true });
        showOrderSuccessToast('@openmrs/esm-patient-orders-app', orders);
      } else {
        setOrdersWithErrors(erroredItems);
      }
      clearOrders({ exceptThoseMatching: (item) => erroredItems.map((e) => e.display).includes(item.display) });
      // Only revalidate current visit since orders create new encounters
      mutateVisitContext?.();
      await mutateOrders();
      invalidateVisitAndEncounterData(mutate, patientUuid);
    }
    setIsSavingOrders(false);
    return () => abortController.abort();
  }, [
    visitContext,
    visitRequired,
    clearOrders,
    closeWorkspace,
    config,
    encounterUuid,
    mutateEncounterUuid,
    mutateOrders,
    mutateVisitContext,
    orders,
    patientUuid,
    session,
    t,
    mutate,
  ]);

  const handleCancel = useCallback(() => {
    closeWorkspace().then((didClose) => {
      if (didClose) {
        clearOrders();
      }
    });
  }, [clearOrders, closeWorkspace]);

  return (
    <Workspace2 title={t('orderBasketWorkspaceTitle', 'Order Basket')} hasUnsavedChanges={!!orders.length}>
      <div id="order-basket" className={styles.container}>
        <ExtensionSlot name="visit-context-header-slot" state={{ patientUuid }} />
        <div className={styles.orderBasketContainer}>
          <ExtensionSlot
            className={classNames(styles.orderBasketSlot, {
              [styles.orderBasketSlotTablet]: isTablet,
            })}
            name="order-basket-slot"
            state={orderBasketExtensionProps as any}
          />
          {config?.orderTypes?.length > 0 &&
            config.orderTypes.map((orderType) => (
              <div className={styles.orderPanel} key={orderType.orderTypeUuid}>
                <GeneralOrderPanel
                  {...orderType}
                  launchGeneralOrderForm={orderBasketExtensionProps.launchGeneralOrderForm}
                  patient={patient}
                />
              </div>
            ))}
        </div>
        <div>
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
            <Button className={styles.actionButton} kind="secondary" onClick={handleCancel}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              className={styles.actionButton}
              kind="primary"
              onClick={handleSave}
              disabled={
                isSavingOrders ||
                !orders?.length ||
                isLoadingEncounterUuid ||
                (visitRequired && !visitContext) ||
                orders?.some(({ isOrderIncomplete }) => isOrderIncomplete)
              }
            >
              {isSavingOrders ? (
                <InlineLoading description={t('saving', 'Saving') + '...'} />
              ) : (
                <span>{t('signAndClose', 'Sign and close')}</span>
              )}
            </Button>
          </ButtonSet>
        </div>
      </div>
    </Workspace2>
  );
};

export default OrderBasket;
