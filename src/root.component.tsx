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
import styles from "./root.css";

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
        <div style={{ height: "2.75rem" }}>
          <Route path="/patient/:patientUuid/chart">
            <PatientBanner match={props.match} />
          </Route>
        </div>
        <div className={styles.grid}>
          <div className={styles.chart}>
            <Route path="/patient/:patientUuid/chart">
              <TopNav />
            </Route>
          </div>
          <div className={styles.workspace}>
            <Route
              path="/patient/:patientUuid/chart"
              render={routeProps => <WorkspaceWrapper {...routeProps} />}
            />
          </div>
          <div className={styles.sidebar}>
            <Sidebar></Sidebar>
          </div>
        </div>
        <div>
          <Route
            path="/patient/:patientUuid/chart"
            component={LevelTwoRoutes}
          />
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

/*
        <div className={styles.banner}>
            <Route path="/patient/:patientUuid/chart">
              <PatientBanner match={props.match} />
            </Route>
          </div>

          <div className={styles.chart}>

            <Route path="/patient/:patientUuid/chart">
              <TopNav/>
            </Route>
          </div>
          <div className={styles.workspace}>
          <Route
          path="/patient/:patientUuid/chart"
          render={routeProps => (
            <WorkspaceWrapper {...routeProps} />
          )}
        />
          </div>

          <div className={styles.sidebar}>
        <Sidebar></Sidebar>
        </div>
*/
