import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, InlineLoading, InlineNotification } from '@carbon/react';
import {
  ExtensionSlot,
  useConfig,
  useLayoutType,
  useSession,
  Workspace2,
  type Visit,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import {
  invalidateVisitAndEncounterData,
  type OrderBasketItem,
  type PatientWorkspace2DefinitionProps,
  postOrders,
  postOrdersOnNewEncounter,
  showOrderSuccessToast,
  useMutatePatientOrders,
  useOrderBasket,
} from '@openmrs/esm-patient-common-lib';
import { useSWRConfig } from 'swr';
import { type ConfigObject } from '../config-schema';
import { useOrderEncounter } from '../api/api';
import GeneralOrderType from './general-order-type/general-order-type.component';
import styles from './order-basket.scss';

interface OrderBasketSlotProps {
  patientUuid: string;
  patient: fhir.Patient;
  visitContext: Visit;
  mutateVisitContext: () => void;
  launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'];
}

const OrderBasket: React.FC<PatientWorkspace2DefinitionProps<{}, {}>> = ({
  groupProps: { patientUuid, patient, visitContext, mutateVisitContext },
  closeWorkspace,
  launchChildWorkspace,
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
        showOrderSuccessToast(t, orders);
      } catch (e) {
        console.error(e);
        setCreatingEncounterError(
          e.responseBody?.error?.message ||
            t('tryReopeningTheWorkspaceAgain', 'Please try launching the workspace again'),
        );
      }
    } else {
      const erroredItems = await postOrders(patientUuid, orderEncounterUuid, abortController);
      if (erroredItems.length == 0) {
        await closeWorkspace({ discardUnsavedChanges: true });
        showOrderSuccessToast(t, orders);
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

  const orderBasketExtensionProps: OrderBasketSlotProps = {
    patientUuid,
    patient,
    visitContext,
    mutateVisitContext,
    launchChildWorkspace,
  };

  return (
    <Workspace2 title={t('orderBasketWorkspaceTitle', 'Order Basket')} hasUnsavedChanges={!!orders.length}>
      <div id="order-basket" className={styles.container}>
        <ExtensionSlot name="visit-context-header-slot" state={orderBasketExtensionProps as any} />{' '}
        {/* TODO: fix typing */}
        <div className={styles.orderBasketContainer}>
          <ExtensionSlot
            className={classNames(styles.orderBasketSlot, {
              [styles.orderBasketSlotTablet]: isTablet,
            })}
            name="order-basket-slot"
            // TODO: fix typing
            state={orderBasketExtensionProps as any}
          />
          {config?.orderTypes?.length > 0 &&
            config.orderTypes.map((orderType) => (
              <div className={styles.orderPanel} key={orderType.orderTypeUuid}>
                <GeneralOrderType
                  {...orderType}
                  closeWorkspace={closeWorkspace}
                  launchChildWorkspace={launchChildWorkspace}
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
