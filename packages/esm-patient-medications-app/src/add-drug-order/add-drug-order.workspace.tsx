import React, { useCallback, useState } from 'react';
import DrugSearch from './drug-search/drug-search.component';
import { type DefaultWorkspaceProps, launchPatientWorkspace, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { DrugOrderForm } from './drug-order-form.component';
import { useSession } from '@openmrs/esm-framework';
import { careSettingUuid, prepMedicationOrderPostData } from '../api/api';
import { ordersEqual } from './drug-search/helpers';
import type { DrugOrderBasketItem } from '../types';

export interface AddDrugOrderWorkspaceAdditionalProps {
  order: DrugOrderBasketItem;
}

export interface AddDrugOrderWorkspace extends DefaultWorkspaceProps, AddDrugOrderWorkspaceAdditionalProps {}

export default function AddDrugOrderWorkspace({
  order: initialOrder,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
}: AddDrugOrderWorkspace) {
  const { orders, setOrders } = useOrderBasket<DrugOrderBasketItem>('medications', prepMedicationOrderPostData);
  const [currentOrder, setCurrentOrder] = useState(initialOrder);
  const session = useSession();

  const cancelDrugOrder = useCallback(() => {
    closeWorkspace({
      onWorkspaceClose: () => launchPatientWorkspace('order-basket'),
    });
  }, [closeWorkspace, currentOrder, orders, setOrders]);

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
      closeWorkspaceWithSavedChanges({
        onWorkspaceClose: () => launchPatientWorkspace('order-basket'),
      });
    },
    [orders, setOrders, closeWorkspaceWithSavedChanges, session.currentProvider.uuid],
  );

  if (!currentOrder) {
    return <DrugSearch openOrderForm={openOrderForm} />;
  } else {
    return (
      <DrugOrderForm
        initialOrderBasketItem={currentOrder}
        onSave={saveDrugOrder}
        onCancel={cancelDrugOrder}
        promptBeforeClosing={promptBeforeClosing}
      />
    );
  }
}
