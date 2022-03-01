import React, { useEffect, useState } from 'react';
import OrderBasketSearch from './order-basket-search.component';
import MedicationOrderForm from './medication-order-form.component';
import OrderBasketItemList from './order-basket-item-list.component';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { Button, ButtonSet, DataTableSkeleton, SearchSkeleton } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { OrderBasketItem } from '../types/order-basket-item';
import { getDurationUnits, getPatientEncounterId, usePatientOrders } from '../api/api';
import { createErrorHandler, showToast, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { OpenmrsResource } from '../types/openmrs-resource';
import { orderDrugs } from './drug-ordering';
import { connect } from 'unistore/react';
import { OrderBasketStore, OrderBasketStoreActions, orderBasketStoreActions } from '../medications/order-basket-store';
import { EmptyState, ErrorState, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import styles from './order-basket.scss';

export interface OrderBasketProps {
  closeWorkspace(): void;
  patientUuid: string;
}

const OrderBasket = connect<OrderBasketProps, OrderBasketStoreActions, OrderBasketStore, {}>(
  'items',
  orderBasketStoreActions,
)(({ patientUuid, items, closeWorkspace, setItems }: OrderBasketProps & OrderBasketStore & OrderBasketStoreActions) => {
  const orderCount = 5;
  const { t } = useTranslation();
  const displayText = t('activeMedications', 'Active medications');
  const headerTitle = t('activeMedications', 'active medications');
  const isTablet = useLayoutType() === 'tablet';

  const [durationUnits, setDurationUnits] = useState<Array<OpenmrsResource>>([]);
  const [encounterUuid, setEncounterUuid] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [medicationOrderFormItem, setMedicationOrderFormItem] = useState<OrderBasketItem | null>(null);
  const [isMedicationOrderFormVisible, setIsMedicationOrderFormVisible] = useState(false);
  const [onMedicationOrderFormSigned, setOnMedicationOrderFormSign] =
    useState<(finalizedOrderBasketItem: OrderBasketItem) => void | null>(null);

  const {
    data: activePatientOrders,
    isError,
    isLoading: isLoadingOrders,
    isValidating,
  } = usePatientOrders(patientUuid, 'ACTIVE');

  const { results: paginatedOrders, goTo, currentPage } = usePagination(activePatientOrders ?? [], orderCount);

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
        if (isLoading) return <SearchSkeleton />;
        if (isMedicationOrderFormVisible) {
          return (
            <MedicationOrderForm
              durationUnits={durationUnits}
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
                      <>
                        <MedicationsDetailsTable
                          isValidating={isValidating}
                          title={t('activeMedications', 'Active Medications')}
                          medications={activePatientOrders}
                          showDiscontinueButton={true}
                          showModifyButton={true}
                          showReorderButton={false}
                          showAddNewButton={false}
                        />
                        <div className={styles.paginationContainer}>
                          <PatientChartPagination
                            currentItems={paginatedOrders.length}
                            onPageNumberChange={({ page }) => goTo(page)}
                            pageNumber={currentPage}
                            pageSize={orderCount}
                            totalItems={activePatientOrders.length}
                          />
                        </div>
                      </>
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
