import React, { useCallback, useState } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { PatientBanner, VisitDialog } from "@openmrs/esm-patient-chart-widgets";
import WorkspaceWrapper from "./workspace/workspace-wrapper.component";
import ChartReview from "./chart-review/chart-review.component";
import styles from "./root.css";
import { AppPropsContext } from "./app-props-context";
import {
  useNavigationContext,
  Extension,
  ExtensionSlot,
  ExtensionSlotProps
} from "@openmrs/esm-react-utils";
import ContextWorkspace from "./workspace/context-workspace.component";

export default function Root(props) {
  const [
    currentWorkspaceExtensionSlot,
    setCurrentWorkspaceExtensionSlot
  ] = useState<React.FC<ExtensionSlotProps>>();
  const [workspaceTitle, setWorkspaceTitle] = useState("");

  const clearCurrentWorkspaceContext = useCallback(() => {
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
        <main
          className="omrs-main-content"
          style={{
            display: "flex",
            alignItems: "flex-start",
            flexDirection: "column"
          }}
        >
          <aside className={styles.patientBanner} style={{ width: "100%" }}>
            <Route path="/patient/:patientUuid/chart">
              <ExtensionSlot extensionSlotName="patient-banner">
                <Extension />
              </ExtensionSlot>
            </Route>
          </aside>
          <div className={styles.grid} style={{ marginTop: "4.9rem" }}>
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
        <ContextWorkspace
          title={workspaceTitle}
          extensionSlot={currentWorkspaceExtensionSlot}
          clearExtensionSlot={clearCurrentWorkspaceContext}
        />
      </BrowserRouter>
    </AppPropsContext.Provider>
  );
}
