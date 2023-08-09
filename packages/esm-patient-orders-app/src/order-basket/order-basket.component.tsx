import React, { useCallback, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { Button, ButtonSet, InlineNotification, ActionableNotification } from '@carbon/react';
import { ExtensionSlot, showModal, showToast, useConfig, useLayoutType, useSession } from '@openmrs/esm-framework';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { orderDrugs } from './drug-ordering';
import { ConfigObject } from '../config-schema';
import { createEmptyEncounter, useOrderEncounter, usePatientOrders } from '../api/api';
import { useOrderBasket } from './useOrderBasket';
import type { OrderBasketItem } from '../types/order-basket-item';
import styles from './order-basket.scss';

export interface OrderBasketProps {
  closeWorkspace(): void;
  patientUuid: string;
}

const OrderBasket: React.FC<OrderBasketProps> = ({ patientUuid, closeWorkspace }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const config = useConfig() as ConfigObject;
  const session = useSession();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const { orders, setOrders, clearOrders } = useOrderBasket();
  const {
    activeVisitRequired,
    isLoading: isLoadingEncounterUuid,
    encounterUuid,
    error: errorFetchingEncounterUuid,
    mutate: mutateEncounterUuid,
  } = useOrderEncounter(patientUuid);
  const [creatingEncounterError, setCreatingEncounterError] = useState('');
  const { mutate: mutateOrders } = usePatientOrders(patientUuid);

  const openStartVisitDialog = useCallback(() => {
    const dispose = showModal('start-visit-dialog', {
      patientUuid,
      closeModal: () => dispose(),
    });
  }, [patientUuid]);

  const updateOrders = useCallback(
    (orderGrouping: string, orders: Array<OrderBasketItem>) => {
      setOrders(orderGrouping, orders);
    },
    [setOrders],
  );

  const handleSave = useCallback(async () => {
    const abortController = new AbortController();
    setCreatingEncounterError('');
    let orderEncounterUuid = encounterUuid;
    // If there's no encounter present, create an encounter for the order.
    if (!orderEncounterUuid) {
      try {
        orderEncounterUuid = await createEmptyEncounter(
          patientUuid,
          config?.drugOrderEncounterType,
          activeVisitRequired ? currentVisit?.uuid : null,
          session?.sessionLocation?.uuid,
          abortController,
        );
        mutateEncounterUuid();
      } catch (e) {
        setCreatingEncounterError(e);
        console.error(e);
        return; // don't try to create the orders if we couldn't create the encounter
      }
    }

    const erroredItems = await orderDrugs(orders, patientUuid, orderEncounterUuid, abortController);
    clearOrders({ exceptThoseMatching: (item) => erroredItems.includes(item) });

    if (erroredItems.length == 0) {
      mutateOrders();
      closeWorkspace();
      showOrderSuccessToast(t, orders);
    } else {
      mutateOrders();
      showOrderFailureToast(t);
    }

    return () => abortController.abort();
  }, [
    mutateOrders,
    mutateEncounterUuid,
    closeWorkspace,
    orders,
    patientUuid,
    encounterUuid,
    activeVisitRequired,
    currentVisit,
    session,
    config,
    t,
  ]);

  const handleCancel = useCallback(() => {
    clearOrders();
    closeWorkspace();
  }, []);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.orderBasketContainer}>
          <ExtensionSlot name="order-basket-slot" state={updateOrders} />
        </div>

        <div>
          {(creatingEncounterError || errorFetchingEncounterUuid) && (
            <InlineNotification
              kind="error"
              title={t('errorCreatingAnEncounter', 'Error when creating an encounter')}
              subtitle={t('tryReopeningTheWorkspaceAgain', 'Please try launching the workspace again')}
              lowContrast={true}
              className={styles.inlineNotification}
              inline
            />
          )}
          <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
            <Button className={styles.button} kind="secondary" onClick={handleCancel}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              className={styles.button}
              kind="primary"
              onClick={handleSave}
              disabled={!orders?.length || isLoadingEncounterUuid || (activeVisitRequired && !currentVisit)}
            >
              {t('signAndClose', 'Sign and close')}
            </Button>
          </ButtonSet>
        </div>
      </div>
      {activeVisitRequired && !currentVisit && (
        <ActionableNotification
          kind="error"
          actionButtonLabel={t('startVisit', 'Start visit')}
          onActionButtonClick={openStartVisitDialog}
          title={t('startAVisitToRecordOrders', 'Start a visit to order')}
          subtitle={t('activeVisitRequired', 'An active visit is required to make orders')}
          lowContrast={true}
          inline
          className={styles.actionNotification}
          hasFocus
        />
      )}
    </>
  );
};

function showOrderSuccessToast(t: TFunction, patientOrderItems: OrderBasketItem[]) {
  const orderedString = patientOrderItems
    .filter((item) => ['NEW', 'RENEWED'].includes(item.action))
    .map((item) => item.drug?.display)
    .join(', ');
  const updatedString = patientOrderItems
    .filter((item) => item.action === 'REVISE')
    .map((item) => item.drug?.display)
    .join(', ');
  const discontinuedString = patientOrderItems
    .filter((item) => item.action === 'DISCONTINUE')
    .map((item) => item.drug?.display)
    .join(', ');

  showToast({
    critical: true,
    kind: 'success',
    title: t('orderCompleted', 'Medications updated'),
    description:
      (orderedString && `${t('ordered', 'Placed order for')} ${orderedString}. `) +
      (updatedString && `${t('updated', 'Updated')} ${updatedString}. `) +
      (discontinuedString && `${t('discontinued', 'Discontinued')} ${discontinuedString}.`),
  });
}

function showOrderFailureToast(t: TFunction) {
  showToast({
    critical: true,
    kind: 'error',
    title: t('error', 'Error'),
    description: t('errorSavingMedicationOrder', 'There were errors saving some medication orders.'),
  });
}

export default OrderBasket;
