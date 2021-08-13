import React, { useEffect, useState } from 'react';
import OrderBasketSearch from './order-basket-search.component';
import MedicationOrderForm from './medication-order-form.component';
import OrderBasketItemList from './order-basket-item-list.component';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import Button from 'carbon-components-react/es/components/Button';
import ButtonSet from 'carbon-components-react/es/components/ButtonSet';
import Loading from 'carbon-components-react/es/components/Loading';
import DataTableSkeleton from 'carbon-components-react/es/components/DataTableSkeleton';
import styles from './order-basket.scss';
import { useTranslation } from 'react-i18next';
import { OrderBasketItem } from '../types/order-basket-item';
import { getDurationUnits, getPatientEncounterId } from '../api/api';
import { createErrorHandler, showToast, showNotification } from '@openmrs/esm-framework';
import { OpenmrsResource } from '../types/openmrs-resource';
import { orderDrugs } from './drug-ordering';
import { connect } from 'unistore/react';
import { OrderBasketStore, OrderBasketStoreActions, orderBasketStoreActions } from '../medications/order-basket-store';
import { usePatientOrders } from '../utils/use-current-patient-orders.hook';

export interface OrderBasketProps {
  patientUuid: string;
  closeWorkspace(): void;
  isTablet: boolean;
}

const OrderBasket = connect<OrderBasketProps, OrderBasketStoreActions, OrderBasketStore, {}>(
  'items',
  orderBasketStoreActions,
)(
  ({
    patientUuid,
    items,
    closeWorkspace,
    setItems,
    isTablet,
  }: OrderBasketProps & OrderBasketStore & OrderBasketStoreActions) => {
    const { t } = useTranslation();
    const [durationUnits, setDurationUnits] = useState<Array<OpenmrsResource>>([]);
    const [encounterUuid, setEncounterUuid] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [medicationOrderFormItem, setMedicationOrderFormItem] = useState<OrderBasketItem | null>(null);
    const [isMedicationOrderFormVisible, setIsMedicationOrderFormVisible] = useState(false);
    const [onMedicationOrderFormSigned, setOnMedicationOrderFormSign] =
      useState<(finalizedOrderBasketItem: OrderBasketItem) => void | null>(null);
    const [activePatientOrders, fetchActivePatientOrders] = usePatientOrders(patientUuid, 'ACTIVE');

    useEffect(() => {
      const abortController = new AbortController();
      const durationUnitsRequest = getDurationUnits(abortController).then(
        (res) => setDurationUnits(res.data.answers),
        createErrorHandler,
      );
      const patientEncounterRequest = getPatientEncounterId(patientUuid, abortController).then(
        ({ data }) => setEncounterUuid(data.results[0].uuid),
        createErrorHandler,
      );

      Promise.all([durationUnitsRequest, patientEncounterRequest]).finally(() => setIsLoading(false));
      return () => abortController.abort();
    }, [patientUuid]);

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
        fetchActivePatientOrders();
        if (erroredItems.length == 0) {
          closeWorkspace();
          showToast({
            kind: 'success',
            critical: true,
            title: t('orderPlaced', 'Order placed'),
            description: t(
              'OrderSavedSuccefully',
              'Your order is complete.The items will now appear on the Orders page succefully',
            ),
          });
        } else {
          showNotification({
            kind: 'error',
            title: t('orderSavedError', 'Error saving order'),
            critical: true,
            description: t('errorEncountered', 'Error encountered while saving the order'),
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
        <Loading active={isLoading} withOverlay={true} />
        {isMedicationOrderFormVisible ? (
          <MedicationOrderForm
            durationUnits={durationUnits}
            initialOrderBasketItem={medicationOrderFormItem}
            onSign={onMedicationOrderFormSigned}
            onCancel={() => setIsMedicationOrderFormVisible(false)}
            isTablet={isTablet}
          />
        ) : (
          <>
            <OrderBasketSearch
              encounterUuid={encounterUuid}
              onSearchResultClicked={handleSearchResultClicked}
              isTablet={isTablet}
            />

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

              {activePatientOrders ? (
                <MedicationsDetailsTable
                  title={t('activeMedications', 'Active Medications')}
                  medications={activePatientOrders}
                  showDiscontinueButton={true}
                  showModifyButton={true}
                  showReorderButton={false}
                  showAddNewButton={false}
                />
              ) : (
                <DataTableSkeleton />
              )}

              <ButtonSet style={{ marginTop: '2rem' }}>
                <Button kind="secondary" onClick={handleCancelClicked}>
                  {t('cancel', 'Cancel')}
                </Button>
                <Button kind="primary" onClick={handleSaveClicked}>
                  {t('save', 'Save')}
                </Button>
              </ButtonSet>
            </div>
          </>
        )}
      </>
    );
  },
);

export default OrderBasket;
