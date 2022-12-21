import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import { connect } from 'unistore/react';
import { Button, ButtonSet, DataTableSkeleton, InlineLoading } from '@carbon/react';
import { showToast, useConfig, useLayoutType, useSession } from '@openmrs/esm-framework';
import { EmptyState, ErrorState, useWorkspaces, useWorkspaceWindowSize } from '@openmrs/esm-patient-common-lib';
import { orderDrugs } from './drug-ordering';
import { ConfigObject } from '../config-schema';
import { useCurrentOrderBasketEncounter, useDurationUnits, usePatientOrders } from '../api/api';
import { OrderBasketItem } from '../types/order-basket-item';
import { OrderBasketStore, OrderBasketStoreActions, orderBasketStoreActions } from '../medications/order-basket-store';
import MedicationOrderForm from './medication-order-form.component';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import OrderBasketItemList from './order-basket-item-list.component';
import OrderBasketSearch from './order-basket-search.component';
import styles from './order-basket.scss';

export interface OrderBasketProps {
  closeWorkspace(): void;
  patientUuid: string;
}

const OrderBasket = connect<OrderBasketProps, OrderBasketStoreActions, OrderBasketStore, {}>(
  ['items', 'pendingOrders'],
  orderBasketStoreActions,
)(
  ({
    patientUuid,
    items,
    closeWorkspace,
    setItems,
    isPending,
  }: OrderBasketProps & OrderBasketStore & OrderBasketStoreActions) => {
    const { t } = useTranslation();
    const { cache, mutate }: { cache: any; mutate: Function } = useSWRConfig();
    const displayText = t('activeMedicationsDisplayText', 'Active medications');
    const headerTitle = t('activeMedicationsHeaderTitle', 'active medications');
    const isTablet = useLayoutType() === 'tablet';
    const config = useConfig() as ConfigObject;
    const { encounterUuid, isLoadingEncounterUuid } = useCurrentOrderBasketEncounter(patientUuid);

    const isLoading = isLoadingEncounterUuid;
    const [orderFormSigned, setOrderFormSigned] = useState(false);

    const [orderFormSaved, setOrderFormSaved] = useState(false);
    const [medicationOrderFormItem, setMedicationOrderFormItem] = useState<OrderBasketItem | null>(null);
    const [isMedicationOrderFormVisible, setIsMedicationOrderFormVisible] = useState(false);
    const [onMedicationOrderFormSigned, setOnMedicationOrderFormSign] =
      useState<(finalizedOrderBasketItem: OrderBasketItem) => void | null>(null);
    const sessionObject = useSession();

    const {
      data: activePatientOrders,
      error,
      isLoading: isLoadingOrders,
      isValidating,
    } = usePatientOrders(patientUuid, 'ACTIVE', config.careSettingUuid);

    useEffect(() => {
      if (medicationOrderFormItem) {
        medicationOrderFormItem.careSetting = config.careSettingUuid;
        medicationOrderFormItem.orderer = sessionObject.currentProvider?.uuid;
        medicationOrderFormItem.quantityUnits = config.quantityUnitsUuid;
        medicationOrderFormItem.encounterUuid = encounterUuid;
      }
    }, [medicationOrderFormItem, config, sessionObject, encounterUuid]);

    const handleSearchResultClicked = (searchResult: OrderBasketItem, directlyAddToBasket: boolean) => {
      if (directlyAddToBasket) {
        setItems([...items, searchResult]);
      } else {
        openMedicationOrderFormForAddingNewOrder(searchResult);
      }
    };

    const openMedicationOrderForm = (item: OrderBasketItem, onSigned: (finalizedOrder: OrderBasketItem) => void) => {
      setMedicationOrderFormItem(item);
      setOnMedicationOrderFormSign((_) => (finalizedOrder) => {
        setOrderFormSigned(true);
        setIsMedicationOrderFormVisible(false);
        setMedicationOrderFormItem(null);
        onSigned(finalizedOrder);
      });
      setIsMedicationOrderFormVisible(true);
    };

    const handleSaveClicked = () => {
      const abortController = new AbortController();
      orderDrugs(items, patientUuid, abortController).then((erroredItems) => {
        setItems(erroredItems);
        if (erroredItems.length == 0) {
          closeWorkspace();

          showToast({
            critical: true,
            kind: 'success',
            title: t('orderCompleted', 'Order placed'),
            description: t(
              'orderCompletedSuccessText',
              'Your order is complete. The items will now appear on the Orders page.',
            ),
          });
          setOrderFormSaved(true);

          const apiUrlPattern = new RegExp(
            '\\/ws\\/rest\\/v1\\/order\\?patient\\=' + patientUuid + '\\&careSetting=' + config.careSettingUuid,
          );

          // Find matching keys from SWR's cache and broadcast a revalidation message to their pre-bound SWR hooks
          Array.from(cache.keys())
            .filter((url: string) => apiUrlPattern.test(url))
            .forEach((url: string) => mutate(url));
        }
      });
      return () => abortController.abort();
    };

    const handleCancelClicked = () => {
      setItems([]);
      closeWorkspace();
    };

    const openMedicationOrderFormForAddingNewOrder = (newOrderBasketItem: OrderBasketItem) => {
      openMedicationOrderForm(newOrderBasketItem, (finalizedOrder) => setItems([...items, finalizedOrder]));
    };

    const openMedicationOrderFormForUpdatingExistingOrder = (existingOrderIndex: number) => {
      const order = items[existingOrderIndex];
      openMedicationOrderForm(order, (finalizedOrder) =>
        setItems(() => {
          const newOrders = [...items];
          newOrders[existingOrderIndex] = finalizedOrder;

          return newOrders;
        }),
      );
    };
    const { workspaces } = useWorkspaces();
    const [minimised, setMinimised] = useState(false);

    const currentWindowSize = workspaces.map((result) => result.additionalProps);

    useEffect(() => {
      if (currentWindowSize[0] === undefined) {
        setMinimised(false);
      } else {
        setMinimised(true);
      }
    });

    useEffect(() => {
      if (minimised && medicationOrderFormItem && !orderFormSigned) {
        isPending(true);
      } else if (orderFormSigned && minimised && !orderFormSaved) {
        isPending(true);
      } else isPending(false);
    }, [minimised, medicationOrderFormItem]);

    if (isLoading) return <InlineLoading className={styles.loader} description={t('loading', 'Loading...')} />;

    if (isMedicationOrderFormVisible) {
      return (
        <MedicationOrderForm
          initialOrderBasketItem={medicationOrderFormItem}
          onSign={onMedicationOrderFormSigned}
          onCancel={() => setIsMedicationOrderFormVisible(false)}
        />
      );
    }

    return (
      <>
        <OrderBasketSearch encounterUuid={encounterUuid} onSearchResultClicked={handleSearchResultClicked} />
        <div className={styles.container}>
          <div className={styles.orderBasketContainer}>
            <OrderBasketItemList
              orderBasketItems={items}
              onItemClicked={(order) => openMedicationOrderFormForUpdatingExistingOrder(items.indexOf(order))}
              onItemRemoveClicked={(order) => {
                const newOrders = [...items];
                newOrders.splice(items.indexOf(order), 1);
                setItems(newOrders);
              }}
            />
            {(() => {
              if (isLoadingOrders) return <DataTableSkeleton role="progressbar" />;

              if (error) return <ErrorState error={error} headerTitle={headerTitle} />;

              if (activePatientOrders?.length) {
                return (
                  <MedicationsDetailsTable
                    isValidating={isValidating}
                    title={t('activeMedicationsTableTitle', 'Active Medications')}
                    medications={activePatientOrders}
                    showDiscontinueButton={true}
                    showModifyButton={true}
                    showReorderButton={false}
                    showAddNewButton={false}
                  />
                );
              }

              return <EmptyState displayText={displayText} headerTitle={headerTitle} />;
            })()}
          </div>
          <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
            <Button className={styles.button} kind="secondary" onClick={handleCancelClicked}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button className={styles.button} kind="primary" onClick={handleSaveClicked}>
              {t('signAndClose', 'Sign and close')}
            </Button>
          </ButtonSet>
        </div>
      </>
    );
  },
);

export default OrderBasket;
