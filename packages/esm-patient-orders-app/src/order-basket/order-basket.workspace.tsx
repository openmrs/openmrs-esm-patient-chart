import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { type TFunction, useTranslation } from 'react-i18next';
import { ActionableNotification, Button, ButtonSet, InlineLoading, InlineNotification } from '@carbon/react';
import {
  ExtensionSlot,
  parseDate,
  showModal,
  showSnackbar,
  useConfig,
  useLayoutType,
  useSession,
  useVisitContextStore,
} from '@openmrs/esm-framework';
import {
  type DefaultPatientWorkspaceProps,
  type OrderBasketItem,
  postOrders,
  postOrdersOnNewEncounter,
  useOrderBasket,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../config-schema';
import { useMutatePatientOrders, useOrderEncounter } from '../api/api';
import styles from './order-basket.scss';
import GeneralOrderType from './general-order-type/general-order-type.component';
import { set } from 'date-fns';

const OrderBasket: React.FC<DefaultPatientWorkspaceProps> = ({
  patientUuid,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const config = useConfig<ConfigObject>();
  const session = useSession();
  const { currentVisit, currentVisitIsRetrospective } = useVisitOrOfflineVisit(patientUuid);
  const { orders, clearOrders } = useOrderBasket();
  const [ordersWithErrors, setOrdersWithErrors] = useState<OrderBasketItem[]>([]);
  const {
    visitRequired,
    isLoading: isLoadingEncounterUuid,
    error: errorFetchingEncounterUuid,
    mutate: mutateEncounterUuid,
  } = useOrderEncounter(patientUuid);
  const [isSavingOrders, setIsSavingOrders] = useState(false);
  const [creatingEncounterError, setCreatingEncounterError] = useState('');
  const [rdeDate, setRdeDate] = useState<Date>();
  const { mutate: mutateOrders } = useMutatePatientOrders(patientUuid);
  const { mutateVisit } = useVisitContextStore();

  useEffect(() => {
    promptBeforeClosing(() => !!orders.length);
  }, [orders, promptBeforeClosing]);

  const openStartVisitDialog = useCallback(() => {
    const dispose = showModal('start-visit-dialog', {
      patientUuid,
      closeModal: () => dispose(),
    });
  }, [patientUuid]);

  const handleRdeDateTimeChange = useCallback(
    (dateTime: { retrospectiveDate: Date; retrospectiveTime: string; retrospectiveTimeFormat: string }) => {
      if (!dateTime.retrospectiveDate || !dateTime.retrospectiveTime || !dateTime.retrospectiveTimeFormat) {
        setRdeDate(undefined);
        return;
      }

      let [rawHour, minute] = dateTime.retrospectiveTime.split(':').map(Number);

      // Adjust hour for AM/PM
      let hour = rawHour;
      if (dateTime.retrospectiveTimeFormat === 'PM' && hour < 12) {
        hour += 12;
      }

      if (dateTime.retrospectiveTimeFormat === 'AM' && hour === 12) {
        hour = 0;
      }

      const completeDate = set(dateTime.retrospectiveDate, {
        hours: hour,
        minutes: minute,
        seconds: 0,
        milliseconds: 0,
      });

      setRdeDate(completeDate);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    const abortController = new AbortController();
    setCreatingEncounterError('');
    setIsSavingOrders(true);
    // If there's no encounter present, create an encounter along with the orders.
    await postOrdersOnNewEncounter(
      patientUuid,
      config?.orderEncounterType,
      visitRequired ? currentVisit : null,
      session?.sessionLocation?.uuid,
      abortController,
      rdeDate,
    );
    mutateEncounterUuid();
    mutateVisit();
    clearOrders();
    await mutateOrders();
    closeWorkspaceWithSavedChanges();
    showOrderSuccessToast(t, orders);
    setIsSavingOrders(false);
    return () => abortController.abort();
  }, [
    patientUuid,
    config?.orderEncounterType,
    visitRequired,
    currentVisit,
    session?.sessionLocation?.uuid,
    rdeDate,
    mutateEncounterUuid,
    mutateVisit,
    clearOrders,
    mutateOrders,
    closeWorkspaceWithSavedChanges,
    t,
    orders,
  ]);

  const handleCancel = useCallback(() => {
    closeWorkspace({ onWorkspaceClose: clearOrders });
  }, [clearOrders, closeWorkspace]);

  return (
    <>
      <div className={styles.container}>
        <ExtensionSlot name="visit-context-header-slot" state={{ patientUuid }} />
        <ExtensionSlot
          name="restrospective-date-time-picker-slot"
          state={{ patientUuid, onChange: handleRdeDateTimeChange }}
        />
        <div className={styles.orderBasketContainer}>
          <ExtensionSlot
            className={classNames(styles.orderBasketSlot, {
              [styles.orderBasketSlotTablet]: isTablet,
            })}
            name="order-basket-slot"
          />
          {config?.orderTypes?.length > 0 &&
            config.orderTypes.map((orderType) => (
              <div className={styles.orderPanel}>
                <GeneralOrderType
                  key={orderType.orderTypeUuid}
                  orderTypeUuid={orderType.orderTypeUuid}
                  label={orderType.label}
                  orderableConceptSets={orderType.orderableConceptSets}
                  closeWorkspace={closeWorkspace}
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
                (visitRequired && !currentVisit) ||
                orders?.some(({ isOrderIncomplete }) => isOrderIncomplete) ||
                (currentVisitIsRetrospective && !rdeDate)
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
      {visitRequired && !currentVisit && (
        <ActionableNotification
          kind="error"
          actionButtonLabel={t('startVisit', 'Start visit')}
          onActionButtonClick={openStartVisitDialog}
          title={t('startAVisitToRecordOrders', 'Start a visit to order')}
          subtitle={t('visitRequired', 'You must select a visit to make orders')}
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

export default OrderBasket;
