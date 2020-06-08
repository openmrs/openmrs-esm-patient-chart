import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import openmrsRootDecorator from "@openmrs/react-root-decorator";
import { PatientBanner, VisitDialog } from "@openmrs/esm-patient-chart-widgets";
import WorkspaceWrapper from "./workspace/workspace-wrapper.component";
import ChartReview from "./chart-review/chart-review.component";
import styles from "./root.css";
import { defineConfigSchema, validators } from "@openmrs/esm-module-config";
import { AppPropsContext } from "./app-props-context";
import { esmPatientChartSchema } from "./openmrs-esm-patient-chart-schema";

function Root(props) {
  defineConfigSchema("@openmrs/esm-patient-chart-app", esmPatientChartSchema);

  return (
    <AppPropsContext.Provider value={{ appProps: props }}>
      <BrowserRouter basename={window["getOpenmrsSpaBase"]()}>
        <main
          className="omrs-main-content"
          style={{
            display: "flex",
            alignItems: "flex-start",
            flexDirection: "column"
          }}
        >
          <aside className={styles.patientBanner}>
            <Route path="/patient/:patientUuid/chart">
              <PatientBanner match={props.match} />
            </Route>
          </aside>
          <div className={styles.grid}>
            <div className={styles.chartreview}>
              <Route path="/patient/:patientUuid/chart/:view?/:subview?">
                <ChartReview />
              </Route>
              <Route
                path="/patient/:patientUuid/chart"
                render={routeProps => <VisitDialog {...routeProps} />}
              />
            </div>
            <div className={styles.workspace}>
              <Route
                path="/patient/:patientUuid/chart"
                render={routeProps => <WorkspaceWrapper {...routeProps} />}
              />
            </div>
          </div>
        </main>
      </BrowserRouter>
    </AppPropsContext.Provider>
  );
}

export default openmrsRootDecorator({
  featureName: "patient-chart",
  moduleName: "@openmrs/esm-patient-chart-app"
})(Root);

export type ChartConfig = {
  primaryNavbar: Navbar[];
  widgetDefinitions: {
    name: string;
    esModule?: string;
    label?: string;
    path?: string;
  };

  dashboardDefinitions: {
    name: string;
    title: string;
    layout: { columns: number };
    widgets: {
      name: string;
      esModule: string;
      label: string;
      path: string;
      layout: {
        rowSpan: number;
        columnSpan: number;
      };
    }[];
  };

  tabbedDashboardDefinitions: {
    name: string;
    title: string;
    navbar: Navbar;
  }[];
};

export type Navbar = { label: string; path: string; view: string };
