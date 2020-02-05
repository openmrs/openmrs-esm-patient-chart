import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import openmrsRootDecorator from "@openmrs/react-root-decorator";
import PatientChartOverview from "./summaries/overview/patient-chart-overview.component";
import PatientBanner from "./banner/patient-banner.component";
import LevelTwoRoutes, {
  levelTwoRoutes
} from "./chart-review/level-two-routes.component";
import Sidebar from "./sidebar/sidebar.component";
import WorkspaceWrapper from "./workspace/workspace-wrapper.component";
import ChartReview from "./chart-review/chart-review.component";
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
        <aside style={{ height: "2.75rem" }}>
          <Route path="/patient/:patientUuid/chart">
            <PatientBanner match={props.match} />
          </Route>
        </aside>
        <div className={styles.grid}>
          <div className={styles.chartreview}>
            <Route path="/patient/:patientUuid/chart">
              <ChartReview />
            </Route>
          </div>
          <div className={styles.workspace}>
            <Route
              path="/patient/:patientUuid/chart"
              render={routeProps => <WorkspaceWrapper {...routeProps} />}
            />
          </div>
        </div>
        <div className={styles.sidebar}>
          <Sidebar></Sidebar>
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
