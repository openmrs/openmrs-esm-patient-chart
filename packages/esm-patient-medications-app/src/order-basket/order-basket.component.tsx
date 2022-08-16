import React, { useEffect, useState } from 'react';
import OrderBasketSearch from './order-basket-search.component';
import MedicationOrderForm from './medication-order-form.component';
import OrderBasketItemList from './order-basket-item-list.component';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { Button, ButtonSet, DataTableSkeleton, InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { OrderBasketItem } from '../types/order-basket-item';
import { createEmptyEncounter, getCurrentOrderBasketEncounter, usePatientOrders } from '../api/api';
import { createErrorHandler, showToast, useConfig, useLayoutType, useSession } from '@openmrs/esm-framework';
import { orderDrugs } from './drug-ordering';
import { connect } from 'unistore/react';
import { OrderBasketStore, OrderBasketStoreActions, orderBasketStoreActions } from '../medications/order-basket-store';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { ConfigObject } from '../config-schema';
import styles from './order-basket.scss';

export interface OrderBasketProps {
  closeWorkspace(): void;
  patientUuid: string;
}

const OrderBasket = connect<OrderBasketProps, OrderBasketStoreActions, OrderBasketStore, {}>(
  'items',
  orderBasketStoreActions,
)(({ patientUuid, items, closeWorkspace, setItems }: OrderBasketProps & OrderBasketStore & OrderBasketStoreActions) => {
  const { t } = useTranslation();
  const displayText = t('activeMedicationsDisplayText', 'Active medications');
  const headerTitle = t('activeMedicationsHeaderTitle', 'active medications');
  const isTablet = useLayoutType() === 'tablet';

  const [encounterUuid, setEncounterUuid] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [medicationOrderFormItem, setMedicationOrderFormItem] = useState<OrderBasketItem | null>(null);
  const [isMedicationOrderFormVisible, setIsMedicationOrderFormVisible] = useState(false);
  const [onMedicationOrderFormSigned, setOnMedicationOrderFormSign] =
    useState<(finalizedOrderBasketItem: OrderBasketItem) => void | null>(null);
  const config = useConfig() as ConfigObject;
  const sessionObject = useSession();
  const {
    data: activePatientOrders,
    isError,
    isLoading: isLoadingOrders,
    isValidating,
  } = usePatientOrders(patientUuid, 'ACTIVE', config.careSettingUuid);

  useEffect(() => {
    const abortController = new AbortController();

    getCurrentOrderBasketEncounter(patientUuid).then(({ data }) => {
      if (data.results?.length) {
        setEncounterUuid(data.results[0].uuid);
        setIsLoading(false);
      } else {
        createEmptyEncounter(patientUuid, sessionObject, config, abortController).then(({ data }) => {
          setEncounterUuid(data?.uuid);
          setIsLoading(false);
        }, createErrorHandler);
      }
    }, createErrorHandler);

    return () => abortController.abort();
  }, [patientUuid, config.durationUnitsConcept]);

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

  return (
    <>
      {(() => {
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
                  if (isError) return <ErrorState error={isError} headerTitle={headerTitle} />;
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
      })()}
    </>
  );
});

export default OrderBasket;
