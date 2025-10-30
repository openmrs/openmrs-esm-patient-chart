import React, { type ComponentProps, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeftIcon, launchWorkspace, useLayoutType } from '@openmrs/esm-framework';
import { type DefaultPatientWorkspaceProps, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { prepMedicationOrderPostData } from '../api/api';
import { ordersEqual } from './drug-search/helpers';
import type { DrugOrderBasketItem } from '../types';
import { DrugOrderForm } from './drug-order-form.component';
import DrugSearch from './drug-search/drug-search.component';
import styles from './add-drug-order.scss';

export interface AddDrugOrderWorkspaceAdditionalProps {
  order: DrugOrderBasketItem;
}

export interface AddDrugOrderWorkspace extends DefaultPatientWorkspaceProps, AddDrugOrderWorkspaceAdditionalProps {}

/**
 * This workspace displays the drug order form. On form submission, it saves the drug order
 * to the (frontend) order basket. For a form that submits the drug order directly on submit,
 * see fill-prescription-form.workspace.tsx
 */
export default function AddDrugOrderWorkspace({
  order: initialOrder,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
  patient,
}: AddDrugOrderWorkspace) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { orders, setOrders } = useOrderBasket<DrugOrderBasketItem>(
    patient,
    'medications',
    prepMedicationOrderPostData,
  );
  const [currentOrder, setCurrentOrder] = useState(initialOrder);

  const cancelDrugOrder = useCallback(() => {
    closeWorkspace({
      onWorkspaceClose: () => launchWorkspace('order-basket'),
      closeWorkspaceGroup: false,
    });
  }, [closeWorkspace]);

  const openOrderForm = useCallback(
    (searchResult: DrugOrderBasketItem) => {
      const existingOrder = orders.find((order) => ordersEqual(order, searchResult));
      if (existingOrder) {
        setCurrentOrder(existingOrder);
      } else {
        setCurrentOrder(searchResult);
      }
    },
    [orders],
  );

  const saveDrugOrder = useCallback(
    async (finalizedOrder: DrugOrderBasketItem) => {
      const newOrders = [...orders];
      const existingOrder = orders.find((order) => ordersEqual(order, finalizedOrder));
      if (existingOrder) {
        newOrders[orders.indexOf(existingOrder)] = {
          ...finalizedOrder,
          // Incomplete orders should be marked completed on saving the form
          isOrderIncomplete: false,
        };
      } else {
        newOrders.push(finalizedOrder);
      }
      setOrders(newOrders);
      closeWorkspaceWithSavedChanges({
        onWorkspaceClose: () => launchWorkspace('order-basket'),
      });
    },
    [orders, setOrders, closeWorkspaceWithSavedChanges],
  );

  if (!currentOrder) {
    return (
      <>
        {!isTablet && (
          <div className={styles.backButton}>
            <Button
              iconDescription="Return to order basket"
              kind="ghost"
              onClick={cancelDrugOrder}
              renderIcon={(props: ComponentProps<typeof ArrowLeftIcon>) => <ArrowLeftIcon size={24} {...props} />}
              size="sm"
            >
              <span>{t('backToOrderBasket', 'Back to order basket')}</span>
            </Button>
          </div>
        )}
        <DrugSearch patient={patient} openOrderForm={openOrderForm} />
      </>
    );
  } else {
    return (
      <div className={styles.container}>
        {!isTablet && (
          <div className={styles.backButton}>
            <Button
              iconDescription="Return to order basket"
              kind="ghost"
              onClick={cancelDrugOrder}
              renderIcon={(props: ComponentProps<typeof ArrowLeftIcon>) => <ArrowLeftIcon size={24} {...props} />}
              size="sm"
            >
              <span>{t('backToOrderBasket', 'Back to order basket')}</span>
            </Button>
          </div>
        )}
        <DrugOrderForm
          initialOrderBasketItem={currentOrder}
          patient={patient}
          onSave={saveDrugOrder}
          saveButtonText={t('saveOrder', 'Save order')}
          onCancel={cancelDrugOrder}
          promptBeforeClosing={promptBeforeClosing}
          allowSelectingPrescribingClinician={false}
          allowSelectingDrug={false} // In this workspace, the drug is selected in <DrugSearch>, not in <DrugOrderForm>
        />
      </div>
    );
  }
}
