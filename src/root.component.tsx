import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import openmrsRootDecorator from "@openmrs/react-root-decorator";
import PatientBanner from "./banner/patient-banner.component";
import WorkspaceWrapper from "./workspace/workspace-wrapper.component";
import ChartReview from "./chart-review/chart-review.component";
import styles from "./root.css";
import { defineConfigSchema, validators } from "@openmrs/esm-module-config";
import { AppPropsContext } from "./app-props-context";

function Root(props) {
  defineConfigSchema("@openmrs/esm-patient-chart", {
    primaryNavBar: {
      arrayElements: {
        label: { validators: [validators.isString] },
        path: { validators: [validators.isString] },
        component: { validators: [validators.isString] }
      },
      default: [
        {
          label: "Summaries",
          path: "/summaries",
          component: "summariesDashboard"
        },
        {
          label: "Results",
          path: "/results",
          component: "results"
        },
        {
          label: "Orders",
          path: "/orders",
          component: "orders"
        },
        {
          label: "Encounters",
          path: "/encounters",
          component: "encounters"
        },
        {
          label: "Conditions",
          path: "/conditions",
          component: "conditions"
        },
        {
          label: "Programs",
          path: "/programs",
          component: "programs"
        },
        {
          label: "Allergies",
          path: "/allergies",
          component: "allergies"
        }
      ]
    },

    dashboardDefinitions: {
      arrayElements: {
        name: { validators: [validators.isString] },
        title: { validators: [validators.isString] },
        layout: {
          columns: { validators: [validators.isString] }
        },
        widgets: {
          arrayElements: {
            name: { validators: [validators.isString] },
            esModule: { validators: [validators.isString] },
            label: { validators: [validators.isString] },
            path: { validators: [validators.isString] }
          }
        }
      },
      default: []
    },

    widgetDefinitions: {
      arrayElements: {
        name: { validators: [validators.isString] },
        esModule: { validators: [validators.isString] },
        label: { validators: [validators.isString] },
        path: { validators: [validators.isString] }
      },
      default: []
    }
  });

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
          <aside style={{ height: "2.75rem" }}>
            <Route path="/patient/:patientUuid/chart">
              <PatientBanner match={props.match} />
            </Route>
          </aside>
          <div className={styles.grid}>
            <div className={styles.chartreview}>
              <Route path="/patient/:patientUuid/chart/:widget?">
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
        </main>
      </BrowserRouter>
    </AppPropsContext.Provider>
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
        <div className={styles.sidebar}>
          <Sidebar></Sidebar>
        </div>
*/
