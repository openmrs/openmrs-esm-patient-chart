import React from "react";
import { Route } from "react-router";
import { BrowserRouter } from "react-router-dom";
import openmrsRootDecorator from "@openmrs/react-root-decorator";
import PatientChartSummary from "./summary/patient-chart-summary.component";
import PatientBanner from "./summary/banner/patient-banner.component";
import { getCurrentPatient } from "@openmrs/esm-api";
import { LevelTwoRoutes } from "./summary/level-two-routes.component";

function Root(props) {
  const [currentPatient, setCurrentPatient] = React.useState(null);
  const [showPatientSummary, setShowPatientSummary] = React.useState(true);

  React.useEffect(() => {
    const subscription = getCurrentPatient().subscribe(patient => {
      setCurrentPatient(patient);
    });

    return () => subscription.unsubscribe();
  });
  return (
    <BrowserRouter basename={window["getOpenmrsSpaBase"]()}>
      <Route path="/patient/:patientUuid/chart">
        <PatientBanner
          match={props.match}
          patient={currentPatient}
          showPatientSummary={setShowPatientSummary}
        />
      </Route>
      <Route
        path="/patient/:patientUuid/chart"
        exact
        component={PatientChartSummary}
      />
      <Route
        path="/patient/:patientUuid/chart"
        render={routeProps => <LevelTwoRoutes match={props.match} />}
      />
    </BrowserRouter>
  );
}

export default openmrsRootDecorator({ featureName: "patient-chart" })(Root);
