import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonSet,
  ComboBox,
  FormLabel,
  InlineLoading,
  InlineNotification,
  Search,
  Stack,
  Tile,
  SkeletonText,
  ButtonSkeleton,
} from '@carbon/react';
import { ShoppingCartArrowUp, Checkmark } from '@carbon/react/icons';
import useSWR, { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';
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
  useDebounce,
  openmrsFetch,
  restBaseUrl,
  ResponsiveWrapper,
  ArrowRightIcon,
  ShoppingCartArrowDownIcon,
  showSnackbar,
} from '@openmrs/esm-framework';
import { useIsDoctorProvider } from '../hooks/useIsDoctorProvider';
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
  priorityOptions,
  type OrderUrgency,
  type TestOrderBasketItem,
} from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../config-schema';
import {
  type ImagingOrderBasketItem,
  type MedicalSupplyOrderBasketItem,
  type ProcedureOrderBasketItem,
  type TestType,
} from '../types/order';
import { type Provider, useOrderEncounterForSystemWithVisitDisabled, useProviders } from '../api/api';
import { prepTestOrderPostData } from '@openmrs/esm-patient-tests-app/src/test-orders/api';
import GeneralOrderPanel from './general-order-type/general-order-panel.component';
import { createEmptyOrder } from './general-order-type/resources';
import {
  createDrugOrder,
  getEarliestStartDate,
  getOrderItemDetails,
  constructOrderItem,
  transformOrderSetMember,
} from './order-basket.utils';
import { orderBasketStore } from '@openmrs/esm-patient-common-lib/src/orders/store';
import styles from './order-basket.scss';
import searchStyles from './general-order-type/add-general-order/search-results.scss';
import { launchWorkspace2 } from '@openmrs/esm-framework';

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

function openmrsFetchMultipleConcepts(urls: Array<string>) {
  return Promise.all(urls.map((url) => openmrsFetch<any>(url)));
}

/**
 * Unified search hook that queries pre-configured concept sets for orderable concepts,
 * and /drug for medications. Only returns results when a search term is specified.
 */
const useUnifiedSearch = (
  searchTerm: string,
  labUuid: string,
  radiologyUuid: string,
  procedureUuid: string,
  medicalSupplyUuid: string,
) => {
  const conceptSets = useMemo(
    () =>
      [
        { category: 'Test', uuid: labUuid },
        { category: 'Radiology/Imaging Procedure', uuid: radiologyUuid },
        { category: 'Procedure', uuid: procedureUuid },
        { category: 'Medical supply', uuid: medicalSupplyUuid },
      ].filter((s) => s.uuid),
    [labUuid, radiologyUuid, procedureUuid, medicalSupplyUuid],
  );

  const {
    data: orderSetsData,
    error: orderSetsError,
    isLoading: isSearchingOrderSets,
  } = useSWR<any>(searchTerm ? `${restBaseUrl}/nidanOrderSet?q=${searchTerm}&v=full` : null, openmrsFetch);

  const {
    data: conceptsData,
    error: conceptsError,
    isLoading: isConceptsLoading,
  } = useSWRImmutable<any[]>(
    conceptSets.length > 0
      ? conceptSets.map(
          (c) =>
            `${restBaseUrl}/concept/${c.uuid}?v=custom:(display,names:(display),uuid,setMembers:(display,uuid,conceptClass:(display)))`,
        )
      : null,
    openmrsFetchMultipleConcepts,
  );

  const {
    data: drugData,
    error: drugError,
    isLoading: isSearchingDrugs,
  } = useSWR<any>(
    searchTerm
      ? `${restBaseUrl}/drug?q=${searchTerm}&v=custom:(uuid,display,name,strength,dosageForm:(display,uuid),concept:(display,uuid),narcotic)`
      : null,
    openmrsFetch,
  );

  const results = useMemo(() => {
    if (searchTerm.length < 2) {
      return [];
    }

    const concepts = [];
    if (conceptsData) {
      conceptsData.forEach((response, index) => {
        const category = conceptSets[index].category;
        // The response is { data: {...} } from openmrsFetch
        const members = response?.data?.setMembers || [];
        members.forEach((m) => {
          concepts.push({
            ...m,
            type: 'concept',
            conceptClass: m.conceptClass || { display: category },
          });
        });
      });
    }

    // Filter concepts by search term
    const lowerSearch = searchTerm.toLowerCase();
    const filteredConcepts = concepts.filter(
      (c) =>
        c.display?.toLowerCase().includes(lowerSearch) ||
        c.names?.some((n) => n.display?.toLowerCase().includes(lowerSearch)),
    );

    const drugs = drugData?.data?.results?.map((d: any) => ({ ...d, type: 'drug' })) || [];
    const orderSets = orderSetsData?.data?.results?.map((os: any) => ({ ...os, type: 'orderset' })) || [];
    return [...filteredConcepts, ...drugs, ...orderSets];
  }, [searchTerm, conceptsData, conceptSets, drugData, orderSetsData]);

  return {
    results,
    isLoading: isConceptsLoading || (!!searchTerm && (isSearchingDrugs || isSearchingOrderSets)),
    error: conceptsError || drugError || orderSetsError,
  };
};

interface SearchResultItemProps {
  item: any;
  patient: fhir.Patient;
  visit: Visit;
  defaultOrderTypeUuid: string;
  orderTypes: any[];
  orderBasketExtensionProps: OrderBasketExtensionProps;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
  onOrderAdded: () => void;
  isDoctor?: boolean;
}

const SearchResultItem: React.FC<SearchResultItemProps> = React.memo(
  ({
    item,
    patient,
    visit,
    defaultOrderTypeUuid,
    orderTypes,
    orderBasketExtensionProps,
    closeWorkspace,
    onOrderAdded,
    isDoctor,
  }) => {
    const { t } = useTranslation();
    const config = useConfig() as ConfigObject;
    const session = useSession();

    const isOrderSet = item.type === 'orderset';
    const details = useMemo(() => (isOrderSet ? null : getOrderItemDetails(item, config)), [item, config, isOrderSet]);
    const { basketKey, prepFn, isDrugItem, isLabItem, isImagingItem, isProcedureItem, isMedicalSupplyItem } =
      details || {};

    const [addedOrderSets, setAddedOrderSets] = useState<string[]>([]);
    // SINGLE useOrderBasket call — subscribes only to the relevant basket
    const { orders, setOrders } = useOrderBasket<any>(patient, basketKey, prepFn);
    const { setOrders: setAnyOrders } = useOrderBasket<any>(patient);

    const itemAlreadyInBasket = useMemo(() => {
      if (isOrderSet) return addedOrderSets?.includes(item.uuid) ?? false;
      return orders?.some((order) => {
        if (isDrugItem) return (order as any).drug?.uuid === item.uuid;
        return order.concept?.uuid === item.uuid;
      });
    }, [orders, item.uuid, isDrugItem, isOrderSet, addedOrderSets]);

    const createOrderItem = useCallback(() => {
      if (isOrderSet) return null;
      return constructOrderItem(item, visit, session.currentProvider?.uuid, details);
    }, [item, visit, session.currentProvider?.uuid, details, isOrderSet]);

    const addToBasket = useCallback(() => {
      if (isDrugItem && item.narcotic && !isDoctor) {
        showSnackbar({
          title: t('narcoticAccessDenied', "This is a narcotic drug and you don't have access to prescribe this"),
          kind: 'error',
        });
        return;
      }
      if (isOrderSet) {
        const members = item.members || [];
        members.forEach((member: any) => {
          const transformed = transformOrderSetMember(member, visit, session.currentProvider?.uuid, config);
          if (transformed) {
            // We need to get the current items for this specific basket to append
            const currentBasketItems = orderBasketStore.getState().items[patient.id]?.[transformed.basketKey] || [];
            setAnyOrders(transformed.basketKey, [...currentBasketItems, transformed.order]);
          }
        });
        setAddedOrderSets([...addedOrderSets, item.uuid]);
      } else {
        const orderItem = createOrderItem();
        setOrders([...orders, orderItem]);
      }
      onOrderAdded();
    }, [
      orders,
      setOrders,
      createOrderItem,
      onOrderAdded,
      isOrderSet,
      item.members,
      item.uuid,
      item.narcotic,
      isDrugItem,
      isDoctor,
      visit,
      session.currentProvider?.uuid,
      config,
      patient.id,
      setAnyOrders,
      addedOrderSets,
      setAddedOrderSets,
      t,
    ]);

    const removeFromBasket = useCallback(() => {
      if (isDrugItem) {
        setOrders(orders.filter((order) => (order as any).drug?.uuid !== item.uuid));
      } else {
        setOrders(orders.filter((order) => order.concept?.uuid !== item.uuid));
      }
    }, [isDrugItem, setOrders, orders, item.uuid]);

    const openForm = useCallback(() => {
      if (isOrderSet) return;
      if (isDrugItem && item.narcotic && !isDoctor) {
        showSnackbar({
          title: t('narcoticAccessDenied', "This is a narcotic drug and you don't have access to prescribe this"),
          kind: 'error',
        });
        return;
      }
      const { labOrderTypeUuid, radiologyOrderTypeUuid, procedureOrderTypeUuid, medicalSupplyOrderTypeUuid } = config;

      if (isDrugItem) {
        orderBasketExtensionProps.launchDrugOrderForm(createDrugOrder(item, visit) as any);
      } else if (isLabItem) {
        const labOrder = createEmptyOrder(item, visit);
        orderBasketExtensionProps.launchLabOrderForm(labOrderTypeUuid, {
          ...labOrder,
          testType: { label: item.display, conceptUuid: item.uuid },
        } as any);
      } else if (isImagingItem) {
        const order = createEmptyOrder(item, visit);
        orderBasketExtensionProps.launchImagingOrderForm(radiologyOrderTypeUuid, {
          ...order,
          testType: { label: item.display, conceptUuid: item.uuid },
        } as any);
      } else if (isProcedureItem) {
        const order = createEmptyOrder(item, visit);
        orderBasketExtensionProps.launchProcedureOrderForm(procedureOrderTypeUuid, {
          ...order,
          testType: { label: item.display, conceptUuid: item.uuid },
        } as any);
      } else if (isMedicalSupplyItem) {
        const order = createEmptyOrder(item, visit);
        orderBasketExtensionProps.launchMedicalSupplyForm(medicalSupplyOrderTypeUuid, {
          ...order,
          testType: { label: item.display, conceptUuid: item.uuid },
        } as any);
      } else {
        orderBasketExtensionProps.launchGeneralOrderForm(basketKey, createEmptyOrder(item, visit));
      }
    }, [
      item,
      visit,
      isOrderSet,
      isDrugItem,
      isLabItem,
      isImagingItem,
      isProcedureItem,
      isMedicalSupplyItem,
      basketKey,
      orderBasketExtensionProps,
      config,
      isDoctor,
      t,
    ]);

    return (
      <Tile className={classNames(searchStyles.searchResultTile)} role="listitem">
        <div className={classNames(searchStyles.searchResultTileContent, searchStyles.text02)}>
          <p>
            <span className={searchStyles.heading}>{item.display || item.name}</span>{' '}
            {item.type === 'drug' && item.strength && <span>{`(${item.strength})`}</span>}
          </p>
          <p>
            {item.type === 'drug'
              ? t('drug', 'Drug')
              : item.type === 'orderset'
                ? t('orderSet', 'Order Set')
                : item.conceptClass?.display}
          </p>
        </div>
        <div className={searchStyles.searchResultActions}>
          {itemAlreadyInBasket ? (
            isOrderSet ? (
              <Button kind="ghost" renderIcon={(props: any) => <Checkmark size={16} {...props} />} disabled>
                {t('added', 'Added')}
              </Button>
            ) : (
              <Button
                kind="danger--ghost"
                renderIcon={(props: any) => <ShoppingCartArrowUp size={16} {...props} />}
                onClick={removeFromBasket}
              >
                {t('remove', 'Remove')}
              </Button>
            )
          ) : (
            <Button
              kind="ghost"
              renderIcon={(props: any) => <ShoppingCartArrowDownIcon size={16} {...props} />}
              onClick={addToBasket}
            >
              Add
            </Button>
          )}
          {!isOrderSet && (
            <Button
              kind="ghost"
              renderIcon={(props: any) => <ArrowRightIcon size={16} {...props} />}
              onClick={openForm}
            >
              {t('goToForm', 'Form')}
            </Button>
          )}
        </div>
      </Tile>
    );
  },
);

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
  const config = useConfig<ConfigObject>();
  const { orderTypes, orderEncounterType, ordererProviderRoles, orderLocationTagName } = config;
  const {
    currentProvider: _currentProvider,
    sessionLocation,
    user: { person },
  } = useSession();
  const currentProvider: Provider | null = useMemo(
    () => (_currentProvider ? { ..._currentProvider, person } : null),
    [_currentProvider, person],
  );
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
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

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
    if (allowSelectingOrderer && providers?.length > 0 && currentProvider) {
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
        // Backend rejects orders whose dateActivated is before the encounter's encounterDatetime,
        // so set encounterDatetime to the earliest startDate among basket items.
        // postOrdersOnNewEncounter clamps this to the visit window before posting.
        const encounterDate = getEarliestStartDate(orders);

        const postedEncounter = await postOrdersOnNewEncounter(
          patientUuid,
          orderEncounterType,
          visitContext,
          orderLocationUuid,
          orderer.uuid,
          abortController,
          encounterDate,
        );
        await closeWorkspace({ discardUnsavedChanges: true });
        mutateEncounterUuid();
        // Only revalidate current visit since orders create new encounters
        mutateVisitContext?.();
        invalidateVisitAndEncounterData(mutate, patientUuid);
        clearOrders();
        await mutateOrders();
        onOrderBasketSubmitted?.(postedEncounter.uuid, postedEncounter.orders);

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
        if (erroredItems.length == 0) {
          await closeWorkspace({ discardUnsavedChanges: true });
          showOrderSuccessToast('@openmrs/esm-patient-orders-app', orders);
        } else {
          setOrdersWithErrors(erroredItems);
          clearOrders({ exceptThoseMatching: (item) => erroredItems.map((e) => e.display).includes(item.display) });
        }
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

  const focusAndClearSearchInput = useCallback(() => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  }, []);

  const {
    results,
    isLoading: isSearching,
    error: searchError,
  } = useUnifiedSearch(
    debouncedSearchTerm,
    config.labConceptSetUuid,
    config.radiologyConceptSetUuid,
    config.procedureConceptSetUuid,
    config.medicalSupplyConceptSetUuid,
  );

  const { isDoctor } = useIsDoctorProvider();

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
          <div className={styles.providerSelectorContainer}>
            <ResponsiveWrapper>
              <Search
                autoFocus
                size="lg"
                placeholder={t('searchOrderPlaceholder', 'Search for an order')}
                labelText={t('searchOrderPlaceholder', 'Search for an order')}
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
                ref={searchInputRef}
              />
            </ResponsiveWrapper>
          </div>
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
          {searchTerm ? (
            <div className={searchStyles.container}>
              <div className={searchStyles.orderBasketSearchResultsHeader}>
                <span className={searchStyles.searchResultsCount}>
                  {isSearching
                    ? t('searching', 'Searching...')
                    : t('searchResultsMatchesForTerm', '{{count}} results for "{{searchTerm}}"', {
                        count: results?.length,
                        searchTerm,
                      })}
                </span>
                <Button kind="ghost" onClick={() => setSearchTerm('')} size={isTablet ? 'md' : 'sm'}>
                  {t('back', 'Back')}
                </Button>
              </div>
              {searchError && (
                <Tile className={searchStyles.emptyState}>
                  <h4 className={searchStyles.heading}>{searchError.message}</h4>
                </Tile>
              )}
              <div className={searchStyles.resultsContainer}>
                {isSearching ? (
                  <div className={searchStyles.searchResultSkeletonWrapper}>
                    <div className={searchStyles.skeletonGrid}>
                      {[...Array(6)].map((_, index) => (
                        <Tile key={index} className={searchStyles.skeletonTile}>
                          <SkeletonText />
                        </Tile>
                      ))}
                    </div>
                  </div>
                ) : (
                  results.map((item) => (
                    <SearchResultItem
                      key={item.uuid}
                      item={item}
                      patient={patient}
                      visit={visitContext}
                      defaultOrderTypeUuid={orderTypes?.[0]?.orderTypeUuid}
                      orderTypes={orderTypes}
                      orderBasketExtensionProps={orderBasketExtensionProps}
                      closeWorkspace={closeWorkspace}
                      onOrderAdded={() => {}}
                      isDoctor={isDoctor}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            <ExtensionSlot
              className={classNames(styles.orderBasketSlot, {
                [styles.orderBasketSlotTablet]: isTablet,
              })}
              name="order-basket-slot"
              state={orderBasketExtensionProps as any}
            />
          )}
          {orderTypes?.length > 0 &&
            orderBasketExtensionProps.launchGeneralOrderForm &&
            orderTypes
              .filter(
                (orderType) =>
                  !orderBasketExtensionProps.visibleOrderPanels ||
                  orderBasketExtensionProps.visibleOrderPanels.includes(orderType.orderTypeUuid),
              )
              .map((orderType) => {
                const { prepFn: prepFunction } = getOrderItemDetails(
                  { conceptClass: { display: orderType.label } } as any,
                  config,
                );

                return (
                  <div className={styles.orderPanel} key={orderType.orderTypeUuid}>
                    <GeneralOrderPanel
                      {...orderType}
                      launchGeneralOrderForm={orderBasketExtensionProps.launchGeneralOrderForm}
                      patient={patient}
                      prepFunction={prepFunction}
                    />
                  </div>
                );
              })}
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
