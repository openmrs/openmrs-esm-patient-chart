import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import openmrsRootDecorator from "@openmrs/react-root-decorator";
import PatientChartSummary from "./summary/patient-chart-summary.component";
import PatientBanner from "./banner/patient-banner.component";
import LevelTwoRoutes, {
  levelTwoRoutes
} from "./summary/level-two-routes.component";
import { Breadcrumbs } from "./summary/breadcrumbs/breadcrumbs.component";
import Sidebar from "./sidebar/sidebar.component";
import WorkspaceWrapper from "./workspace/workspace-wrapper.component";

function Root(props) {
  return (
    <BrowserRouter basename={window["getOpenmrsSpaBase"]()}>
      <Route path="/patient/:patientUuid/chart">
        <PatientBanner match={props.match} />
      </Route>
      <main
        className="omrs-main-content"
        style={{ display: "flex", paddingTop: "2.8rem" }}
      >
        <Sidebar></Sidebar>
        <div style={{ flex: 1 }}>
          <Breadcrumbs
            rootUrl={getPatientChartRootUrl()}
            routes={levelTwoRoutes}
          />
          <Route
            path="/patient/:patientUuid/chart"
            exact
            component={PatientChartSummary}
          />
          <Route
            path="/patient/:patientUuid/chart"
            component={LevelTwoRoutes}
          />
        </div>
        <div
          style={{
            width: ".1rem",
            border: ".5px solid var(--omrs-color-ink-lowest-contrast)"
          }}
        ></div>
        <Route
          path="/patient/:patientUuid/chart"
          render={routeProps => (
            <WorkspaceWrapper {...routeProps} style={{ flex: 1 }} />
          )}
        />
      </main>
    </BrowserRouter>
  );
}

function getPatientChartRootUrl() {
  return {
    url: "/patient/:patientUuid/chart/",
    name: "Chart"
  };
}

export default openmrsRootDecorator({
  featureName: "patient-chart",
  moduleName: "@openmrs/esm-patient-chart"
})(Root);
