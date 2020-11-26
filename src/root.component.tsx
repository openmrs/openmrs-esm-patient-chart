import React from "react";

import { BrowserRouter, Route } from "react-router-dom";
";

import {
  useNavigationContext,
  ExtensionSlot,
  ExtensionSlotProps
} from "@openmrs/esm-react-utils";
import { defineConfigSchema } from "@openmrs/esm-config";
import { PatientBanner, VisitDialog } from "@openmrs/esm-patient-chart-widgets";

import { AppPropsContext } from "./app-props-context";
import { esmPatientChartSchema } from "./config-schemas/openmrs-esm-patient-chart-schema";
import WorkspaceWrapper from "./workspace/workspace-wrapper.component";
import ChartReview from "./chart-review/chart-review.component";
import ContextWorkspace from "./workspace/context-workspace.component";
import TopNav from "./top-nav/top-nav.component";
import styles from "./root.scss";

export default function Root(props) {
  defineConfigSchema("@openmrs/esm-patient-chart-app", esmPatientChartSchema);

  const [
    currentWorkspaceExtensionSlot,
    setCurrentWorkspaceExtensionSlot
  ] = React.useState<React.FC<ExtensionSlotProps>>();
  const [workspaceTitle, setWorkspaceTitle] = React.useState("");

  const clearCurrentWorkspaceContext = React.useCallback(() => {
    setCurrentWorkspaceExtensionSlot(undefined);
    setWorkspaceTitle("");
  }, []);

  useNavigationContext({
    type: "workspace",
    handler: (link, state: { title?: string }) => {
      setCurrentWorkspaceExtensionSlot(() => (
        <ExtensionSlot
          extensionSlotName={link}
          state={{ closeWorkspace: clearCurrentWorkspaceContext, ...state }}
        />
      ));
      setWorkspaceTitle(state.title ?? "");
      return true;
    }
  });

  return (
    <AppPropsContext.Provider value={{ appProps: props }}>
      <BrowserRouter basename={window["getOpenmrsSpaBase"]()}>
        <div className={styles.landingPage}>
          <div className={`bx--grid  bx--grid--full-width`}>
            <div className="bx--row">
              <aside className="bx--col">
                <Route path="/patient/:patientUuid/chart">
                  <PatientBanner match={props.match} />
                </Route>
              </aside>
            </div>
            <div className="bx--row">
              <div className="bx--col">
                <Route path="/patient/:patientUuid/chart/:view?/:subview?">
                  <TopNav />
                </Route>
              </div>
            </div>
            <div className="bx--row">
              <div className="bx--col">
                <p className={styles.heading}>Patient Summary</p>
                <Route path="/patient/:patientUuid/chart/:view?/:subview?">
                  <ChartReview />
                </Route>
                <Route
                  path="/patient/:patientUuid/chart"
                  render={routeProps => <VisitDialog {...routeProps} />}
                />
                <Route
                  path="/patient/:patientUuid/chart"
                  render={routeProps => <WorkspaceWrapper {...routeProps} />}
                />
              </div>
            </div>
          </div>
        </div>
        <ContextWorkspace
          title={workspaceTitle}
          extensionSlot={currentWorkspaceExtensionSlot}
          clearExtensionSlot={clearCurrentWorkspaceContext}
        />
      </BrowserRouter>
    </AppPropsContext.Provider>
  );
}
