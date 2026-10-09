import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, FormLabel, InlineLoading, InlineNotification } from '@carbon/react';
import { useSWRConfig } from 'swr';
import {
  Extension,
  ExtensionSlot,
  getPatientName,
  PatientBannerPatientInfo,
  PatientPhoto,
  LocationPicker,
  useConfig,
  useLayoutType,
  useSession,
  type Visit,
  Workspace2,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import {
  ClinicianPicker,
  EncounterDateTimePicker,
  invalidateVisitAndEncounterData,
  type Order,
  type OrderBasketExtensionProps,
  type OrderBasketItem,
  postOrders,
  postOrdersOnNewEncounter,
  showOrderSuccessToast,
  useEncounterProvider,
  useMutatePatientOrders,
  useOrderBasket,
} from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../config-schema';
import { useOrderEncounterForSystemWithVisitDisabled } from '../api/api';
import GeneralOrderPanel from './general-order-type/general-order-panel.component';
import styles from './order-basket.scss';

interface OrderBasketProps {
  patientUuid: string;
  patient: fhir.Patient;
  visitContext: Visit;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
  orderBasketExtensionProps: OrderBasketExtensionProps;
  showPatientBanner?: boolean;
  onOrderBasketSubmitted?: (encounterUuid: string, postedOrders: Array<Order>) => void;
}

const OrderBasket: React.FC<OrderBasketProps> = ({
  patientUuid,
  patient,
  visitContext,
  closeWorkspace,
  orderBasketExtensionProps,
  showPatientBanner,
  onOrderBasketSubmitted,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { orderTypes, orderEncounterType, ordererProviderRoles, orderLocationTagName } = useConfig<ConfigObject>();
  const { sessionLocation } = useSession();
  const { orders, clearOrders } = useOrderBasket(patient);
  const [ordersWithErrors, setOrdersWithErrors] = useState<OrderBasketItem[]>([]);
  const {
    visitRequired,
    isLoading: isLoadingEncounterUuid,
    encounterUuid: orderEncounterUuid,
    error: errorFetchingEncounterUuid,
    mutate: mutateEncounterUuid,
  } = useOrderEncounterForSystemWithVisitDisabled(patientUuid);
  const [isSavingOrders, setIsSavingOrders] = useState(false);
  const [creatingEncounterError, setCreatingEncounterError] = useState('');
  const { mutate: mutateOrders } = useMutatePatientOrders(patientUuid);
  const { mutate } = useSWRConfig();

  const [orderLocationUuid, setOrderLocationUuid] = useState(sessionLocation.uuid);

  // Users who may act on behalf of others can pick the orderer (optionally limited to `ordererProviderRoles`);
  // everyone else is the orderer themselves.
  const {
    provider: orderer,
    setProvider: setOrderer,
    canChoose: canChooseOrderer,
    encounterProviders,
  } = useEncounterProvider({ providerRoles: ordererProviderRoles });

  // `null` means "now": the encounter is stamped by the server
  const [encounterDatetime, setEncounterDatetime] = useState<Date | null>(null);
  const [encounterDatetimeError, setEncounterDatetimeError] = useState<string | undefined>();

  const handleSave = useCallback(async () => {
    const abortController = new AbortController();
    setCreatingEncounterError('');

    setIsSavingOrders(true);
    // orderEncounterUuid should only be preset if the system does not support visits, and the user has an order encounter today.
    // If orderEncounterUuid is not present, then create an encounter along with the orders.
    // If orderEncounterUuid is present, then just post the orders to that encounter.
    if (!orderEncounterUuid) {
      try {
        const postedEncounter = await postOrdersOnNewEncounter(
          patientUuid,
          orderEncounterType,
          visitContext,
          orderLocationUuid,
          orderer.uuid,
          abortController,
          {
            encounterDatetime,
            encounterProviders: canChooseOrderer ? encounterProviders : undefined,
          },
        );
        await closeWorkspace({ discardUnsavedChanges: true });
        mutateEncounterUuid();
        invalidateVisitAndEncounterData(mutate, patientUuid);
        clearOrders();
        await mutateOrders();
        onOrderBasketSubmitted?.(postedEncounter.uuid, postedEncounter.orders);

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
      try {
        const { postedOrders, erroredItems } = await postOrders(
          patientUuid,
          orderEncounterUuid,
          abortController,
          orderer.uuid,
        );
        clearOrders({ exceptThoseMatching: (item) => erroredItems.map((e) => e.display).includes(item.display) });
        await mutateOrders();
        invalidateVisitAndEncounterData(mutate, patientUuid);

        if (erroredItems.length == 0) {
          await closeWorkspace({ discardUnsavedChanges: true });
          showOrderSuccessToast('@openmrs/esm-patient-orders-app', orders);
        } else {
          setOrdersWithErrors(erroredItems);
        }
        clearOrders({ exceptThoseMatching: (item) => erroredItems.map((e) => e.display).includes(item.display) });
        await mutateOrders();
        invalidateVisitAndEncounterData(mutate, patientUuid);
        onOrderBasketSubmitted?.(orderEncounterUuid, postedOrders);
      } catch (e) {
        console.error(e);
        setCreatingEncounterError(
          e.responseBody?.error?.message ||
            t('tryReopeningTheWorkspaceAgain', 'Please try launching the workspace again'),
        );
      }
    }
    setIsSavingOrders(false);
    return () => abortController.abort();
  }, [
    visitContext,
    clearOrders,
    closeWorkspace,
    orderEncounterType,
    orderEncounterUuid,
    mutateEncounterUuid,
    mutateOrders,
    orders,
    patientUuid,
    t,
    mutate,
    orderer,
    canChooseOrderer,
    encounterProviders,
    encounterDatetime,
    orderLocationUuid,
    onOrderBasketSubmitted,
  ]);

  const handleCancel = useCallback(() => {
    closeWorkspace().then((didClose) => {
      if (didClose) {
        clearOrders();
      }
    });
  }, [clearOrders, closeWorkspace]);

  const patientName = getPatientName(patient);
  const extensionProps = useMemo(() => ({ ...orderBasketExtensionProps }), [orderBasketExtensionProps]);

  return (
    <Workspace2 title={t('orderBasketWorkspaceTitle', 'Order Basket')} hasUnsavedChanges={!!orders.length}>
      <div id="order-basket" className={styles.container}>
        {showPatientBanner && (
          <div className={styles.patientBannerContainer}>
            <div className={styles.patientBanner}>
              <div className={styles.patientAvatar}>
                <PatientPhoto patientUuid={patient.id} patientName={patientName} />
              </div>
              <PatientBannerPatientInfo patient={patient}></PatientBannerPatientInfo>
            </div>
          </div>
        )}
        <div className={styles.orderBasketContainer}>
          {!orderEncounterUuid && (
            <EncounterDateTimePicker
              id="order-basket"
              dateLabel={t('orderDate', 'Order date')}
              timingLabel={t('theseOrdersAre', 'These orders are')}
              visit={visitContext}
              value={encounterDatetime}
              onChange={setEncounterDatetime}
              onValidityChange={setEncounterDatetimeError}
            />
          )}
          <ClinicianPicker
            id="order-basket"
            labelText={t('orderer', 'Orderer')}
            value={orderer}
            onChange={setOrderer}
            providerRoles={ordererProviderRoles}
          />
          {orderLocationTagName && (
            <div className={styles.orderLocationOuterContainer}>
              <FormLabel>{t('orderLocation', 'Order location')}</FormLabel>
              <div className={styles.orderLocationContainer}>
                <LocationPicker
                  selectedLocationUuid={orderLocationUuid}
                  onChange={setOrderLocationUuid}
                  locationTag={orderLocationTagName}
                />
              </div>
            </div>
          )}
          <ExtensionSlot
            className={classNames(styles.orderBasketSlot, {
              [styles.orderBasketSlotTablet]: isTablet,
            })}
            name="order-basket-slot"
          >
            {(extension) =>
              (!orderBasketExtensionProps.visibleOrderPanels ||
                !extension.config?.orderTypeUuid ||
                orderBasketExtensionProps.visibleOrderPanels.includes(extension.config.orderTypeUuid)) && (
                <Extension state={extensionProps} />
              )
            }
          </ExtensionSlot>
          {orderTypes?.length > 0 &&
            orderBasketExtensionProps.launchGeneralOrderForm &&
            orderTypes
              .filter(
                (orderType) =>
                  !orderBasketExtensionProps.visibleOrderPanels ||
                  orderBasketExtensionProps.visibleOrderPanels.includes(orderType.orderTypeUuid),
              )
              .map((orderType) => (
                <GeneralOrderPanel
                  key={orderType.orderTypeUuid}
                  {...orderType}
                  launchGeneralOrderForm={orderBasketExtensionProps.launchGeneralOrderForm}
                  patient={patient}
                />
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
                orders?.some(({ isOrderIncomplete }) => isOrderIncomplete) ||
                !orderer ||
                Boolean(encounterDatetimeError) ||
                !orderLocationUuid
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
