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
  useVisit,
} from '@openmrs/esm-framework';
import {
  type amPm,
  convertTime12to24,
  type DefaultPatientWorkspaceProps,
  type OrderBasketItem,
  invalidateVisitAndEncounterData,
  postOrders,
  postOrdersOnNewEncounter,
  useOrderBasket,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import { useSWRConfig } from 'swr';
import { type ConfigObject } from '../config-schema';
import { useMutatePatientOrders, useOrderEncounter } from '../api/api';
import GeneralOrderType from './general-order-type/general-order-type.component';
import { format, isWithinInterval, parse, set } from 'date-fns';
import styles from './order-basket.scss';

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
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const currentVisitIsRetrospective = Boolean(currentVisit?.stopDatetime);

  const { orders, clearOrders } = useOrderBasket();
  const [ordersWithErrors, setOrdersWithErrors] = useState<OrderBasketItem[]>([]);
  const {
    visitRequired,
    isLoading: isLoadingEncounterUuid,
    encounterUuid,
    error: errorFetchingEncounterUuid,
    mutate: mutateEncounterUuid,
  } = useOrderEncounter(patientUuid, config.orderEncounterType);
  const [isSavingOrders, setIsSavingOrders] = useState(false);
  const [creatingEncounterError, setCreatingEncounterError] = useState('');
  const [hasRdeDateBoundsError, setHasRdeDateBoundsError] = useState(false);
  const [rdeDate, setRdeDate] = useState<Date>();
  const { mutate: mutateOrders } = useMutatePatientOrders(patientUuid);
  const { mutate: mutateCurrentVisit } = useVisit(patientUuid);
  const { mutate } = useSWRConfig();

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
    (dateTime: { retrospectiveDate: Date; retrospectiveTime: string; retrospectiveTimeFormat: amPm }) => {
      if (!dateTime.retrospectiveDate || !dateTime.retrospectiveTime || !dateTime.retrospectiveTimeFormat) {
        setRdeDate(undefined);
        return;
      }

      let [hour, minute] = convertTime12to24(dateTime.retrospectiveTime, dateTime.retrospectiveTimeFormat);

      const completeDate = set(dateTime.retrospectiveDate, {
        hours: hour,
        minutes: minute,
        seconds: 0,
        milliseconds: 0,
      });

      setRdeDate(completeDate);

      if (!currentVisit) {
        return;
      }

      // check if the date is within the bounds of the current visit
      const isWithinBounds = isWithinInterval(completeDate, {
        // setting seconds to 0 for consistency to avoid issues like 2023-10-01T00:00:00.000Z vs 2023-10-01T00:00:09.000Z
        start: set(new Date(currentVisit.startDatetime), { seconds: 0 }),
        end: currentVisit.stopDatetime ? new Date(currentVisit.stopDatetime) : new Date(),
      });

      if (!isWithinBounds) {
        setHasRdeDateBoundsError(true);
        return;
      }

      if (isWithinBounds && hasRdeDateBoundsError) {
        setHasRdeDateBoundsError(false);
      }
    },
    [currentVisit, hasRdeDateBoundsError],
  );

  const handleSave = useCallback(async () => {
    const abortController = new AbortController();
    setCreatingEncounterError('');
    let orderEncounterUuid = encounterUuid;
    if (hasRdeDateBoundsError && currentVisit) {
      showSnackbar({
        isLowContrast: true,
        kind: 'error',
        title: t('orderDateOutOfBounds', 'Order date is out of bounds'),
        subtitle: t('orderDateOutOfBoundsMessage', `The order date must be within {{startDate}} and {{endDate}}.`, {
          startDate: format(currentVisit.startDatetime, 'PPP hh:mm a'),
          endDate: currentVisit.stopDatetime
            ? format(currentVisit.stopDatetime, 'PPP hh:mm a')
            : t('currentDate', 'current date'),
        }),
      });
      return;
    }
    setIsSavingOrders(true);

    // If there's no encounter present or we are adding retrospective data, create an encounter along with the orders.
    if (!orderEncounterUuid || rdeDate) {
      try {
        await postOrdersOnNewEncounter(
          patientUuid,
          config?.orderEncounterType,
          visitRequired ? currentVisit : null,
          session?.sessionLocation?.uuid,
          abortController,
          rdeDate,
        );
        mutateEncounterUuid();
        // Only revalidate current visit since orders create new encounters
        mutateCurrentVisit();
        invalidateVisitAndEncounterData(mutate, patientUuid);
        clearOrders();
        await mutateOrders();

        closeWorkspaceWithSavedChanges();
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
      clearOrders({ exceptThoseMatching: (item) => erroredItems.map((e) => e.display).includes(item.display) });
      // Only revalidate current visit since orders create new encounters
      mutateCurrentVisit();
      await mutateOrders();
      invalidateVisitAndEncounterData(mutate, patientUuid);

      if (erroredItems.length == 0) {
        closeWorkspaceWithSavedChanges();
        showOrderSuccessToast(t, orders);
      } else {
        setOrdersWithErrors(erroredItems);
      }
    }
    setIsSavingOrders(false);
    return () => abortController.abort();
  }, [
    encounterUuid,
    patientUuid,
    config?.orderEncounterType,
    visitRequired,
    currentVisit,
    session?.sessionLocation?.uuid,
    rdeDate,
    mutateEncounterUuid,
    clearOrders,
    mutateOrders,
    mutateCurrentVisit,
    orders,
    t,
    closeWorkspaceWithSavedChanges,
    hasRdeDateBoundsError,
    mutate,
  ]);

  const handleCancel = useCallback(() => {
    closeWorkspace({ onWorkspaceClose: clearOrders });
  }, [clearOrders, closeWorkspace]);

  return (
    <>
      <div className={styles.container}>
        <ExtensionSlot name="visit-context-header-slot" state={{ patientUuid }} />

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
          <ExtensionSlot
            name="restrospective-date-time-picker-slot"
            state={{ patientUuid, onChange: handleRdeDateTimeChange }}
          />
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
          {hasRdeDateBoundsError && currentVisit && (
            <InlineNotification
              kind="error"
              title={t('orderDateOutOfBounds', 'Order date is out of bounds')}
              subtitle={t(
                'orderDateOutOfBoundsMessage',
                `The order date must be within {{startDate}} and {{endDate}}.`,
                {
                  startDate: format(currentVisit!.startDatetime, 'PPP hh:mm a'),
                  endDate: currentVisit!.stopDatetime
                    ? format(currentVisit!.stopDatetime, 'PPP hh:mm a')
                    : t('currentDate', 'current date'),
                },
              )}
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
