import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { type TFunction, useTranslation } from 'react-i18next';
import { ActionableNotification, Button, ButtonSet, InlineNotification } from '@carbon/react';
import { ExtensionSlot, showModal, showToast, useConfig, useLayoutType, useSession } from '@openmrs/esm-framework';
import {
  postOrders,
  useOrderBasket,
  useVisitOrOfflineVisit,
  OrderBasketItem,
  DefaultWorkspaceProps,
} from '@openmrs/esm-patient-common-lib';
import { ConfigObject } from '../config-schema';
import { createEmptyEncounter, useOrderEncounter, useMutatePatientOrders } from '../api/api';
import styles from './order-basket.scss';

const OrderBasket: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace, promptBeforeClosing }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const config = useConfig<ConfigObject>();
  const session = useSession();
  const { activeVisit } = useVisitOrOfflineVisit(patientUuid);
  const { orders, clearOrders } = useOrderBasket();
  const {
    activeVisitRequired,
    isLoading: isLoadingEncounterUuid,
    encounterUuid,
    error: errorFetchingEncounterUuid,
    mutate: mutateEncounterUuid,
  } = useOrderEncounter(patientUuid);
  const [creatingEncounterError, setCreatingEncounterError] = useState('');
  const { mutate: mutateOrders } = useMutatePatientOrders(patientUuid);

  useEffect(() => {
    promptBeforeClosing(() => false);
  }, [promptBeforeClosing]);

  const openStartVisitDialog = useCallback(() => {
    const dispose = showModal('start-visit-dialog', {
      patientUuid,
      closeModal: () => dispose(),
    });
  }, [patientUuid]);

  const handleSave = useCallback(async () => {
    const abortController = new AbortController();
    setCreatingEncounterError('');
    let orderEncounterUuid = encounterUuid;
    // If there's no encounter present, create an encounter for the order.
    if (!orderEncounterUuid) {
      try {
        orderEncounterUuid = await createEmptyEncounter(
          patientUuid,
          config?.orderEncounterType,
          activeVisitRequired ? activeVisit : null,
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

    const erroredItems = await postOrders(orderEncounterUuid, abortController);
    clearOrders({ exceptThoseMatching: (item) => erroredItems.map((e) => e.display).includes(item.display) });
    mutateOrders();
    if (erroredItems.length == 0) {
      closeWorkspace();
      showOrderSuccessToast(t, orders);
    } else {
      showOrderFailureToast(t);
    }

    return () => abortController.abort();
  }, [
    activeVisit,
    activeVisitRequired,
    clearOrders,
    closeWorkspace,
    config,
    encounterUuid,
    mutateEncounterUuid,
    mutateOrders,
    orders,
    patientUuid,
    session,
    t,
  ]);

  const handleCancel = useCallback(() => {
    clearOrders();
    closeWorkspace();
  }, [clearOrders, closeWorkspace]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.orderBasketContainer}>
          <ExtensionSlot
            className={classNames(styles.orderBasketSlot, {
              [styles.orderBasketSlotTablet]: isTablet,
            })}
            name="order-basket-slot"
          />
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
          <ButtonSet className={styles.buttonSet}>
            <Button className={styles.bottomButton} kind="secondary" onClick={handleCancel}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              className={styles.bottomButton}
              kind="primary"
              onClick={handleSave}
              disabled={!orders?.length || isLoadingEncounterUuid || (activeVisitRequired && !activeVisit)}
            >
              {t('signAndClose', 'Sign and close')}
            </Button>
          </ButtonSet>
        </div>
      </div>
      {activeVisitRequired && !activeVisit && (
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

  showToast({
    critical: true,
    kind: 'success',
    title: t('orderCompleted', 'Placed orders'),
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
    description: t('errorSavingOrder', 'There were errors saving some orders.'),
  });
}

export default OrderBasket;
