import React from "react";
import MedicationsSummary from "../medications-summary/medications-summary.component";
import styles from "../root.scss";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Provider } from "unistore/react";
import { orderBasketStore } from "./order-basket-store";

export interface RootMedicationSummaryProps {
  patientUuid: string;
}

export default function RootMedicationSummary({
  patientUuid
}: RootMedicationSummaryProps) {
  return (
    <div className={styles.resetPatientChartWidgetContainer}>
      <BrowserRouter basename={window["getOpenmrsSpaBase"]()}>
        <Switch>
          <Route exact path="/patient/:patientUuid/chart/orders">
            <Provider store={orderBasketStore}>
              <MedicationsSummary patientUuid={patientUuid} />
            </Provider>
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}
