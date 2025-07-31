import React, { type ComponentProps, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ArrowLeftIcon, useLayoutType, useSession, Workspace2 } from '@openmrs/esm-framework';
import { type PatientWorkspace2DefinitionProps, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { careSettingUuid, prepMedicationOrderPostData } from '../api/api';
import { ordersEqual } from './drug-search/helpers';
import type { DrugOrderBasketItem } from '../types';
import { DrugOrderForm } from './drug-order-form.component';
import DrugSearch from './drug-search/drug-search.component';
import styles from './add-drug-order.scss';

export interface AddDrugOrderWorkspaceAdditionalProps {
  order: DrugOrderBasketItem;
}

export default function AddDrugOrderWorkspace({
  workspaceProps: { order: initialOrder },
  closeWorkspace,
}: PatientWorkspace2DefinitionProps<AddDrugOrderWorkspaceAdditionalProps, {}>) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { orders, setOrders } = useOrderBasket<DrugOrderBasketItem>('medications', prepMedicationOrderPostData);
  const [currentOrder, setCurrentOrder] = useState(initialOrder);
  const session = useSession();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
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
    (finalizedOrder: DrugOrderBasketItem) => {
      finalizedOrder.careSetting = careSettingUuid;
      finalizedOrder.orderer = session.currentProvider.uuid;
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
      closeWorkspace({ discardUnsavedChanges: true });
    },
    [orders, setOrders, closeWorkspace, session.currentProvider.uuid],
  );

  return (
    <Workspace2 title={t('addDrugOrderWorkspaceTitle', 'Add drug order')} hasUnsavedChanges={hasUnsavedChanges}>
      {!currentOrder ? (
        <>
        {!isTablet && (
          <div className={styles.backButton}>
            <Button
              iconDescription="Return to order basket"
              kind="ghost"
              onClick={() => closeWorkspace()}
              renderIcon={(props: ComponentProps<typeof ArrowLeftIcon>) => <ArrowLeftIcon size={24} {...props} />}
              size="sm"
            >
              <span>{t('backToOrderBasket', 'Back to order basket')}</span>
            </Button>
          </div>
        )}
        <DrugSearch closeWorkspace={closeWorkspace} openOrderForm={openOrderForm} />
        </> ): (
          <DrugOrderForm
            initialOrderBasketItem={currentOrder}
            onSave={saveDrugOrder}
            onCancel={() => closeWorkspace()}
            setHasUnsavedChanges={setHasUnsavedChanges}
          />
        )}
    </Workspace2>
  );
}
