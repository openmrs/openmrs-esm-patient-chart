import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import openmrsRootDecorator from "@openmrs/react-root-decorator";
import PatientChartSummary from "./summary/patient-chart-summary.component";
import PatientBanner from "./summary/banner/patient-banner.component";
import { getCurrentPatient } from "@openmrs/esm-api";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { LevelTwoRoutes } from "./summary/level-two-routes";

function Root(props) {
  const [currentPatient, setCurrentPatient] = React.useState(null);
  const [showPatientSummary, setShowPatientSummary] = React.useState(true);

  React.useEffect(() => {
    const subscription = getCurrentPatient().subscribe(patient => {
      setCurrentPatient(patient);
      createErrorHandler();
    });

    return () => subscription.unsubscribe();
  });
  return (
    <main className="omrs-main-content">
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
        {currentPatient && (
          <Route path="/patient/:patientUuid/chart">
            <LevelTwoRoutes match={props.match} patient={currentPatient} />
          </Route>
        )}
      </BrowserRouter>
    </main>
  );
}

export default openmrsRootDecorator({ featureName: "patient-chart" })(Root);
