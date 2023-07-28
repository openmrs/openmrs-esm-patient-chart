import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, DataTableSkeleton, InlineNotification, ActionableNotification } from '@carbon/react';
import { showModal, showToast, useConfig, useLayoutType, useSession, useStore } from '@openmrs/esm-framework';
import { EmptyState, ErrorState, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { orderDrugs } from './drug-ordering';
import { ConfigObject } from '../config-schema';
import { createEmptyEncounter, useOrderEncounter, usePatientOrders } from '../api/api';
import { getOrderItems, orderBasketStore, orderBasketStoreActions } from '../medications/order-basket-store';
import type { OrderBasketItem } from '../types/order-basket-item';
import MedicationOrderForm from './medication-order-form.component';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import OrderBasketItemList from './order-basket-item-list.component';
import OrderBasketSearch from './order-basket-search/drug-search.component';
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

  const { mutateOrders } = usePatientOrders(patientUuid, 'ACTIVE');
  const displayText = t('activeMedicationsDisplayText', 'Active medications');
  const headerTitle = t('activeMedicationsHeaderTitle', 'active medications');
  const isTablet = useLayoutType() === 'tablet';
  const config = useConfig() as ConfigObject;
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const session = useSession();
  const {
    activeVisitRequired,
    isLoading: isLoadingEncounterUuid,
    encounterUuid,
    error: errorFetchingEncounterUuid,
    mutate: mutateEncounterUuid,
  } = useOrderEncounter(patientUuid);
  const [creatingEncounterError, setCreatingEncounterError] = useState(false);
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
  } = usePatientOrders(patientUuid, 'ACTIVE');
  const noCurrentVisit = activeVisitRequired && !currentVisit;

  const openStartVisitDialog = useCallback(() => {
    const dispose = showModal('start-visit-dialog', {
      patientUuid,
      closeModal: () => dispose(),
    });
  }, [patientUuid]);

  useEffect(() => {
    if (medicationOrderFormItem) {
      medicationOrderFormItem.careSetting = config.careSettingUuid;
      medicationOrderFormItem.orderer = sessionObject.currentProvider?.uuid;
    }
  }, [medicationOrderFormItem, config, sessionObject]);

  const handleSearchResultClicked = (searchResult: OrderBasketItem, directlyAddToBasket: boolean) => {
    if (directlyAddToBasket) {
      setItems([...patientOrderItems, searchResult]);
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

  const handleSaveClicked = async () => {
    const abortController = new AbortController();

    setCreatingEncounterError(false);
    let orderEncounterUuid = encounterUuid;
    // If there's no encounter present, stop the order from being created and create an encounter.
    if (!orderEncounterUuid) {
      orderEncounterUuid = await createEmptyEncounter(
        patientUuid,
        config?.drugOrderEncounterType,
        activeVisitRequired ? currentVisit?.uuid : null,
        session?.sessionLocation?.uuid,
        abortController,
      )
        .then((uuid) => {
          mutateEncounterUuid();
          return uuid;
        })
        .catch((e) => {
          setCreatingEncounterError(true);
          return null;
        });    
      return;  // don't create the order
    }

    orderDrugs(patientOrderItems, patientUuid, orderEncounterUuid, abortController).then((erroredItems) => {
      setItems(erroredItems);

      if (erroredItems.length == 0) {
        mutateOrders();
        closeWorkspace();

        showToast({
          critical: true,
          kind: 'success',
          title: t('orderCompleted', 'Order placed'),
          description: t(
            'orderCompletedSuccessText',
            'Your order is complete. The items will now appear on the Medications page.',
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
    openMedicationOrderForm(newOrderBasketItem, (finalizedOrder) => setItems([...patientOrderItems, finalizedOrder]));
  };

  const openMedicationOrderFormForUpdatingExistingOrder = (existingOrderIndex: number) => {
    const order = patientOrderItems[existingOrderIndex];
    openMedicationOrderForm(order, (finalizedOrder) => {
      const newOrders = [...patientOrderItems];
      newOrders[existingOrderIndex] = finalizedOrder;
      setItems(newOrders);
    });
  };

  useEffect(() => {
    if (errorFetchingEncounterUuid || createEmptyEncounter) {
      console.error(errorFetchingEncounterUuid ?? createEmptyEncounter);
    }
  }, [errorFetchingEncounterUuid, creatingEncounterError]);

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
            onItemClicked={(order) => openMedicationOrderFormForUpdatingExistingOrder(patientOrderItems.indexOf(order))}
            onItemRemoveClicked={(order) => {
              const newOrders = [...patientOrderItems];
              newOrders.splice(patientOrderItems.indexOf(order), 1);
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
                  patientUuid={patientUuid}
                />
              );
            }

            return <EmptyState displayText={displayText} headerTitle={headerTitle} />;
          })()}
        </div>

        <div>
          {(creatingEncounterError || errorFetchingEncounterUuid) && (
            <InlineNotification
              kind="error"
              title={t('errorCreatingAnEncounter', 'Error when creating an encounter')}
              subtitle={t('tryReopeningTheWorkspaceAgain', 'Please try launching the workspace again')}
              lowContrast={true}
              className={styles.inlineNotification}
              inline
            />
          )}
          {noCurrentVisit && (
            <ActionableNotification
              kind="error"
              actionButtonLabel={t('startVisit', 'Start visit')}
              onActionButtonClick={openStartVisitDialog}
              title={t('startAVisitToRecordOrders', 'Start a visit to order')}
              subtitle={t('activeVisitRequired', 'An active visit is required to make orders')}
              lowContrast={true}
              inline
              className={styles.actionNotification}
              hasFocus
            />
          )}
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

export default OrderBasket;
