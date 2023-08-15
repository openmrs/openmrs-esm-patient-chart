import React, { useCallback, useEffect, useState } from 'react';
import OrderBasketSearch from './drug-search/drug-search.component';
import {
  DefaultWorkspaceProps,
  OrderBasketItem,
  launchPatientWorkspace,
  useOrderBasket,
} from '@openmrs/esm-patient-common-lib';
import { DrugOrderForm } from './drug-order-form.component';
import { showToast, useConfig, usePatient, useSession } from '@openmrs/esm-framework';
import { ConfigObject } from '../config-schema';
import { usePatientOrders } from '../api/api';
import { useTranslation } from 'react-i18next';

export interface AddDrugOrderWorkspaceAdditionalProps {
  order: OrderBasketItem;
}

export interface AddDrugOrderWorkspace extends DefaultWorkspaceProps, AddDrugOrderWorkspaceAdditionalProps {}

export default function AddDrugOrderWorkspace({ order: initialOrder, closeWorkspace }: AddDrugOrderWorkspace) {
  const { t } = useTranslation();
  const { orders, setOrders } = useOrderBasket('medications');
  const patient = usePatient();
  const activeOrders = usePatientOrders(patient.patientUuid, 'ACTIVE');
  const [currentOrder, setCurrentOrder] = useState(initialOrder);
  const config: ConfigObject = useConfig();
  const session = useSession();

  const cancelDrugOrder = useCallback(() => {
    setOrders(orders.filter((order) => !ordersEqual(order, currentOrder)));
    closeWorkspace();
    launchPatientWorkspace('order-basket');
  }, [closeWorkspace, currentOrder, orders, setOrders]);

  const chooseDrug = useCallback(
    (searchResult: OrderBasketItem, directlyAddToBasket: boolean) => {
      if (activeOrders.data?.find((existing) => existing.drug?.concept.uuid === searchResult.drug?.concept.uuid)) {
        showToast({
          kind: 'warning',
          title: t('drugAlreadyOrdered', 'Drug already ordered'),
          description: t(
            'drugAlreadyOrderedDescription',
            `${searchResult.drug.concept.display} is already ordered for this patient.`,
          ),
        });
        return;
      }
      setOrders([...orders, searchResult]);
      if (directlyAddToBasket) {
        closeWorkspace();
      } else {
        setCurrentOrder(searchResult);
      }
    },
    [setOrders, orders, closeWorkspace, activeOrders.data, t],
  );

  const saveDrugOrder = useCallback(
    (finalizedOrder: OrderBasketItem) => {
      finalizedOrder.careSetting = config.careSettingUuid;
      finalizedOrder.orderer = session.currentProvider.uuid;
      const newOrders = [...orders];
      const existingOrder = orders.find((order) => ordersEqual(order, finalizedOrder));
      newOrders[orders.indexOf(existingOrder)] = finalizedOrder;
      setOrders(newOrders);
      closeWorkspace();
      launchPatientWorkspace('order-basket');
    },
    [orders, setOrders, closeWorkspace, config.careSettingUuid, session.currentProvider.uuid],
  );

  if (!currentOrder) {
    return <OrderBasketSearch onSearchResultClicked={chooseDrug} />;
  } else {
    return <DrugOrderForm initialOrderBasketItem={currentOrder} onSave={saveDrugOrder} onCancel={cancelDrugOrder} />;
  }
}

function ordersEqual(order1: OrderBasketItem, order2: OrderBasketItem) {
  return order1.action === order2.action && order1.commonMedicationName === order2.commonMedicationName;
}
