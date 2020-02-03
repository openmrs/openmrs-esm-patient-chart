import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import openmrsRootDecorator from "@openmrs/react-root-decorator";
import PatientChartOverview from "./summaries/overview/patient-chart-overview.component";
import PatientBanner from "./banner/patient-banner.component";
import LevelTwoRoutes, {
  levelTwoRoutes
} from "./summaries/level-two-routes.component";
import Sidebar from "./sidebar/sidebar.component";
import WorkspaceWrapper from "./workspace/workspace-wrapper.component";
import TopNav from "./top-nav/top-nav.component";
import { blockStatement } from "@babel/types";

function Root(props) {
  return (
    <BrowserRouter basename={window["getOpenmrsSpaBase"]()}>
      <main
        className="omrs-main-content"
        style={{
          display: "flex",
          alignItems: "flex-start",
          flexDirection: "column"
        }}
      >
        <Route path="/patient/:patientUuid/chart">
          <PatientBanner match={props.match} />
        </Route>

        <div
          style={{
            display: "flex",
            alignItems: "left",
            flexDirection: "row",
            justifyContent: "left"
          }}
        >
          <Route path="/patient/:patientUuid/chart">
            <TopNav />
          </Route>
          <Route
            path="/patient/:patientUuid/chart"
            render={routeProps => (
              <WorkspaceWrapper {...routeProps} style={{ flex: 1 }} />
            )}
          />

          <div
            style={{
              marginTop: "5.5rem"
            }}
          >
            <Route
              path="/patient/:patientUuid/chart"
              component={LevelTwoRoutes}
            />

            <Sidebar></Sidebar>
          </div>
        </div>
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
