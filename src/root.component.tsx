import React from "react";
import { Route } from "react-router";
import { BrowserRouter } from "react-router-dom";
import openmrsRootDecorator from "@openmrs/react-root-decorator";
import PatientChartSummary from "./summary/patient-chart-summary.component";

function Root(props) {
  return (
    <BrowserRouter>
      <Route to="/patient/:patientUuid/chart" component={PatientChartSummary} />
    </BrowserRouter>
  );
}

export default openmrsRootDecorator({ featureName: "patient-chart" })(Root);
