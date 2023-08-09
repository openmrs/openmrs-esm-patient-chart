import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { Button, ButtonSet, DataTableSkeleton, InlineNotification, ActionableNotification } from '@carbon/react';
import { showModal, showToast, useConfig, useLayoutType, useSession, useStore } from '@openmrs/esm-framework';
import { EmptyState, ErrorState, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { orderDrugs } from '../add-drug-order/drug-ordering';
import { ConfigObject } from '../config-schema';
import { createEmptyEncounter, useOrderEncounter, usePatientOrders } from '../api/api';
import { getOrderItems, orderBasketStore, orderBasketStoreActions } from './order-basket-store';
import type { OrderBasketItem } from '../types/order-basket-item';
import MedicationOrderForm from '../add-drug-order/medication-order-form.component';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import OrderBasketItemList from './order-basket-item-list.component';
import OrderBasketSearch from '../add-drug-order/order-basket-search/drug-search.component';
import styles from './order-basket.scss';

export interface OrderBasketProps {
  closeWorkspace(): void;
  patientUuid: string;
}

const OrderBasket: React.FC<OrderBasketProps> = ({ patientUuid, closeWorkspace }) => {
  const { t } = useTranslation();

  const store = useStore(orderBasketStore);
  const setItems = useCallback((items: OrderBasketItem[]) => orderBasketStoreActions.setOrderBasketItems(items), []);
  const patientOrderItems = useMemo(() => getOrderItems(store.items, patientUuid), [store, patientUuid]);
  const displayText = t('activeMedicationsDisplayText', 'Active medications');
  const headerTitle = t('activeMedicationsHeaderTitle', 'active medications');
  const isTablet = useLayoutType() === 'tablet';
  const config = useConfig() as ConfigObject;
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

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
    mutate: mutateOrders,
  } = usePatientOrders(patientUuid, 'ACTIVE');

  useEffect(() => {
    if (medicationOrderFormItem) {
      medicationOrderFormItem.careSetting = config.careSettingUuid;
      medicationOrderFormItem.orderer = sessionObject.currentProvider?.uuid;
    }
  }, [medicationOrderFormItem, config, sessionObject]);

  const openMedicationOrderForm = (item: OrderBasketItem, onSigned: (finalizedOrder: OrderBasketItem) => void) => {
    setMedicationOrderFormItem(item);
    setOnMedicationOrderFormSign((_) => (finalizedOrder) => {
      setIsMedicationOrderFormVisible(false);
      setMedicationOrderFormItem(null);
      onSigned(finalizedOrder);
    });
    setIsMedicationOrderFormVisible(true);
  };

  const handleSearchResultClicked = useCallback(
    (searchResult: OrderBasketItem, directlyAddToBasket: boolean) => {
      if (directlyAddToBasket) {
        setItems([...patientOrderItems, searchResult]);
      } else {
        openMedicationOrderForm(searchResult, (finalizedOrder) => setItems([...patientOrderItems, finalizedOrder]));
      }
    },
    [patientOrderItems, setItems],
  );

  const openMedicationOrderFormToUpdateExistingOrder = useCallback(
    (order: OrderBasketItem) => {
      const existingOrderIndex = patientOrderItems.indexOf(order);
      openMedicationOrderForm(order, (finalizedOrder) => {
        const newOrders = [...patientOrderItems];
        newOrders[existingOrderIndex] = finalizedOrder;
        setItems(newOrders);
      });
    },
    [patientOrderItems, setItems],
  );

  const openMedicationOrderFormToRemoveItem = useCallback(
    (order: OrderBasketItem) => {
      const newOrders = [...patientOrderItems];
      newOrders.splice(patientOrderItems.indexOf(order), 1);
      setItems(newOrders);
    },
    [patientOrderItems, setItems],
  );

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
      <OrderBasketSearch onSearchResultClicked={handleSearchResultClicked} />
      <div className={styles.container}>
        <div className={styles.orderBasketContainer}>
          <OrderBasketItemList
            orderBasketItems={patientOrderItems}
            onItemClicked={openMedicationOrderFormToUpdateExistingOrder}
            onItemRemoveClicked={openMedicationOrderFormToRemoveItem}
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
                  showAddButton={false}
                  showDiscontinueButton={true}
                  showModifyButton={true}
                  showReorderButton={false}
                  patientUuid={patientUuid}
                />
              );
            }

            return <EmptyState displayText={displayText} headerTitle={headerTitle} />;
          })()}
        </div>

        <div>
          <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
            <Button className={styles.button} kind="secondary" onClick={handleCancelClicked}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button
              className={styles.button}
              kind="primary"
              onClick={handleSaveClicked}
              disabled={!patientOrderItems?.length || isLoadingEncounterUuid || noCurrentVisit}
            >
              {t('signAndClose', 'Sign and close')}
            </Button>
          </ButtonSet>
        </div>
      </div>
    </>
  );
};

function showDrugSuccessToast(t: TFunction, patientOrderItems: OrderBasketItem[]) {
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

function showDrugFailureToast(t: TFunction) {
  showToast({
    critical: true,
    kind: 'error',
    title: t('error', 'Error'),
    description: t('errorSavingMedicationOrder', 'There were errors saving some medication orders.'),
  });
}

export default OrderBasket;
