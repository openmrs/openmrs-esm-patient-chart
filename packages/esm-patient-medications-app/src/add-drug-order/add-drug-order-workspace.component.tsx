import React, { useCallback, useEffect, useState } from "react";
import OrderBasketSearch from "./drug-search/drug-search.component";
import { DefaultWorkspaceProps, OrderBasketItem, launchPatientWorkspace, useOrderBasket } from "@openmrs/esm-patient-common-lib";
import { DrugOrderForm } from "./drug-order-form.component";

export interface AddDrugOrderWorkspace extends DefaultWorkspaceProps {
  order: OrderBasketItem;
}

export default function AddDrugOrderWorkspace({ order: initialOrder, closeWorkspace }: AddDrugOrderWorkspace) {
  const { orders, setOrders } = useOrderBasket('medications');
  const [currentOrder, setCurrentOrder] = useState(initialOrder);

  const chooseDrug = useCallback(
    (searchResult: OrderBasketItem, directlyAddToBasket: boolean) => {
      console.log("adding search result to orders", searchResult);
      setOrders([...orders, searchResult]);
      if (directlyAddToBasket) {
        closeWorkspace();
      } else {
        setCurrentOrder(searchResult);
      }
    },
    [setOrders, orders, closeWorkspace],
  );

  useEffect(() => {
    console.log("orders changed", orders);
  }, [orders]);

  const saveMedicationOrder = useCallback((finalizedOrder: OrderBasketItem) => {
    const newOrders = [...orders];
    const currentOrder = orders.find(order => order.action === finalizedOrder.action && order.commonMedicationName === finalizedOrder.commonMedicationName)
    newOrders[orders.indexOf(currentOrder)] = finalizedOrder;
    console.log("saving medication order. orders:", orders, "finalized order", finalizedOrder, "newOrders", newOrders);
    setOrders(newOrders);
    closeWorkspace();
    launchPatientWorkspace("order-basket");
  }, [orders, setOrders, currentOrder]);

  if (!currentOrder) {
    return <OrderBasketSearch onSearchResultClicked={chooseDrug}/>
  } else {
    return <DrugOrderForm initialOrderBasketItem={currentOrder} onSave={saveMedicationOrder} onCancel={closeWorkspace} />;
  }
}

