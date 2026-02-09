import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, ComboBox, FormLabel, InlineLoading, InlineNotification, Stack } from '@carbon/react';
import { useSWRConfig } from 'swr';
import {
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
  invalidateVisitAndEncounterData,
  type Order,
  type OrderBasketExtensionProps,
  type OrderBasketItem,
  postOrders,
  postOrdersOnNewEncounter,
  showOrderSuccessToast,
  useMutatePatientOrders,
  useOrderBasket,
} from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../config-schema';
import { type Provider, useOrderEncounterForSystemWithVisitDisabled, useProviders } from '../api/api';
import GeneralOrderPanel from './general-order-type/general-order-panel.component';
import styles from './order-basket.scss';

interface OrderBasketProps {
  patientUuid: string;
  patient: fhir.Patient;
  visitContext: Visit;
  mutateVisitContext: () => void;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
  orderBasketExtensionProps: OrderBasketExtensionProps;
  showPatientBanner?: boolean;
  onOrderBasketSubmitted?: (encounterUuid: string, postedOrders: Array<Order>) => void;
}

const OrderBasket: React.FC<OrderBasketProps> = ({
  patientUuid,
  patient,
  visitContext,
  mutateVisitContext,
  closeWorkspace,
  orderBasketExtensionProps,
  showPatientBanner,
  onOrderBasketSubmitted,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { orderTypes, orderEncounterType, ordererProviderRoles, orderLocationTagName } = useConfig<ConfigObject>();
  const {
    currentProvider: _currentProvider,
    sessionLocation,
    user: { person },
  } = useSession();
  const currentProvider: Provider = useMemo(() => ({ ..._currentProvider, person }), [_currentProvider, person]);
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

  const allowSelectingOrderer = ordererProviderRoles?.length > 0;
  const {
    providers,
    isLoading: isLoadingProviders,
    error: errorLoadingProviders,
  } = useProviders(allowSelectingOrderer ? ordererProviderRoles : null);

  // If configured to allow selecting providers, we wait till we fetched the allowable providers
  // before setting the orderer. If not configured, we assume the current user is the orderer.
  const [orderer, setOrderer] = useState<Provider>(allowSelectingOrderer ? null : currentProvider);

  useEffect(() => {
    if (allowSelectingOrderer && providers?.length > 0) {
      // default orderer to current user if they have the right provider roles
      if (providers.some((p) => p.uuid === currentProvider.uuid)) {
        setOrderer(currentProvider);
      }
    }
  }, [allowSelectingOrderer, providers, currentProvider]);

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
        );
        await closeWorkspace({ discardUnsavedChanges: true });
        mutateEncounterUuid();
        // Only revalidate current visit since orders create new encounters
        mutateVisitContext?.();
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
        // Only revalidate current visit since orders create new encounters
        mutateVisitContext?.();
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
    mutateVisitContext,
    orders,
    patientUuid,
    t,
    mutate,
    orderer,
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
  const filterItemsByProviderName = useCallback((menu) => {
    return menu?.item?.person?.display?.toLowerCase().includes(menu?.inputValue?.toLowerCase());
  }, []);

  return (
    <Workspace2 title={t('orderBasketWorkspaceTitle', 'Order Basket')} hasUnsavedChanges={!!orders.length}>
      <div id="order-basket" className={styles.container}>
        <ExtensionSlot name="visit-context-header-slot" state={{ patientUuid }} />
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
          {!isLoadingProviders &&
            allowSelectingOrderer &&
            (errorLoadingProviders ? (
              <InlineNotification
                kind="warning"
                lowContrast
                className={styles.inlineNotification}
                title={t('errorLoadingClinicians', 'Error loading clinicians')}
                subtitle={t('tryReopeningTheForm', 'Please try launching the form again')}
              />
            ) : (
              <div className={styles.providerSelectorContainer}>
                <ComboBox
                  id="orderer-combobox"
                  items={providers ?? []}
                  onChange={({ selectedItem }) => {
                    setOrderer(selectedItem);
                  }}
                  initialSelectedItem={orderer}
                  shouldFilterItem={filterItemsByProviderName}
                  itemToString={(item: Provider) => item?.person.display ?? ''}
                  placeholder={t('searchFieldPlaceholder', 'Search for a Provider')}
                  titleText={t('orderer', 'Orderer')}
                />
              </div>
            ))}
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
            state={{ ...orderBasketExtensionProps }}
          />
          {orderTypes?.length > 0 &&
            orderTypes
              .filter(
                (orderType) =>
                  !orderBasketExtensionProps.visibleOrderPanels ||
                  orderBasketExtensionProps.visibleOrderPanels.includes(orderType.orderTypeUuid),
              )
              .map((orderType) => (
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
                orders?.some(({ isOrderIncomplete }) => isOrderIncomplete) ||
                !orderer ||
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
