import React, { useCallback, useState } from 'react';
import DrugSearch from './drug-search/drug-search.component';
import {
  type DefaultWorkspaceProps,
  launchPatientWorkspace,
  useOrderBasket,
  type OrderBasketItem,
} from '@openmrs/esm-patient-common-lib';
import { useSession } from '@openmrs/esm-framework';
import { careSettingUuid, prepMedicationOrderPostData } from '../api/api';
import type { DrugOrderBasketItem } from '../types';
import { ordersEqual } from './drug-search/helpers';
import { DrugOrderForm } from './drug-order-form.component';

export interface AddDrugOrderWorkspaceAdditionalProps {
  order: DrugOrderBasketItem;
}

export interface AddDrugOrderWorkspace extends DefaultWorkspaceProps, AddDrugOrderWorkspaceAdditionalProps {}

export default function AddDrugOrderWorkspace({ order: initialOrder, closeWorkspace }: AddDrugOrderWorkspace) {
  const { orders, setOrders } = useOrderBasket<DrugOrderBasketItem>('medications', prepMedicationOrderPostData);
  const [currentOrder, setCurrentOrder] = useState<DrugOrderBasketItem | null>(initialOrder);
  const session = useSession();

  const cancelDrugOrder = useCallback(() => {
    closeWorkspace();
    launchPatientWorkspace('order-basket');
  }, [closeWorkspace]);

  const openOrderForm = useCallback(
    (orderItem: OrderBasketItem | DrugOrderBasketItem) => {
      // Check if the orderItem is an existing order
      if ('uuid' in orderItem && orderItem.uuid) {
        // Existing order: set it as the current order for editing
        setCurrentOrder(orderItem as DrugOrderBasketItem);
      } else {
        // New order: create a new order based on the order basket item
        const searchResult = orderItem as DrugOrderBasketItem;
        const existingOrder = orders.find((order) => ordersEqual(order, searchResult));
        if (existingOrder) {
          setCurrentOrder(existingOrder);
        } else {
          setCurrentOrder(searchResult);
        }
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
      closeWorkspace();
      launchPatientWorkspace('order-basket');
    },
    [orders, setOrders, closeWorkspace, session.currentProvider.uuid],
  );

  if (!currentOrder) {
    return <DrugSearch openOrderForm={openOrderForm} />;
  } else {
    return <DrugOrderForm initialOrderBasketItem={currentOrder} onSave={saveDrugOrder} onCancel={cancelDrugOrder} />;
  }
}
