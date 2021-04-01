import React from "react";
import OrderBasket from "../order-basket/order-basket.component";
import { BrowserRouter } from "react-router-dom";
import { switchTo, useCurrentPatient } from "@openmrs/esm-framework";
import { Provider } from "unistore/react";
import { orderBasketStore } from "./order-basket-store";

export interface RootOrderBasketProps {
  patientUuid?: string;
  closeWorkspace?: () => void;
}

export default function RootOrderBasket({
  patientUuid,
  closeWorkspace: closeWorkspace
}: RootOrderBasketProps) {
  const [, , fallbackPatientUuid] = useCurrentPatient();
  patientUuid = patientUuid ?? fallbackPatientUuid;
  closeWorkspace = closeWorkspace ?? (() => switchTo("link", ""));

  return (
    <BrowserRouter basename={window["getOpenmrsSpaBase"]()}>
      <Provider store={orderBasketStore}>
        <OrderBasket
          patientUuid={patientUuid}
          closeWorkspace={closeWorkspace}
        />
      </Provider>
    </BrowserRouter>
  );
}
