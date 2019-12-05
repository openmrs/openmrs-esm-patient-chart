import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import openmrsRootDecorator from "@openmrs/react-root-decorator";
import PatientChartSummary from "./summary/patient-chart-summary.component";
import PatientBanner from "./summary/banner/patient-banner.component";
import { LevelTwoRoutes } from "./summary/level-two-routes.component";
import { LevelThreeRoutes } from "./summary/level-three-routes.component";

function Root(props) {
  return (
    <BrowserRouter basename={window["getOpenmrsSpaBase"]()}>
      <Route path="/patient/:patientUuid/chart">
        <PatientBanner match={props.match} />
      </Route>
      <Route
        path="/patient/:patientUuid/chart"
        exact
        component={PatientChartSummary}
      />
      <Route path="/patient/:patientUuid/chart" component={LevelTwoRoutes} />
      <Route
        path="/patient/:patientUuid/chart/:levelTwo"
        component={LevelThreeRoutes}
      />
    </BrowserRouter>
  );
}

export default openmrsRootDecorator({
  featureName: "patient-chart",
  moduleName: "@openmrs/esm-patient-chart"
})(Root);
