import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Route, RouteComponentProps } from "react-router-dom";
import { VisitDialog } from "@openmrs/esm-patient-chart-widgets";
import { attach, detach } from "@openmrs/esm-extensions";
import {
  useNavigationContext,
  ExtensionSlot,
  ExtensionSlotProps
} from "@openmrs/esm-react-utils";
import WorkspaceWrapper from "./workspace/workspace-wrapper.component";
import ChartReview from "./chart-review/chart-review.component";
import styles from "./root.css";
import { AppPropsContext } from "./app-props-context";
import ContextWorkspace from "./workspace/context-workspace.component";
import { basePath } from "./constants";

interface RouteParams {
  patientUuid: string;
}

const PatientInfo: React.FC<RouteComponentProps<RouteParams>> = props => {
  const patientUuid = props.match.params.patientUuid;
  const basePath = props.location.pathname;
  return (
    <ExtensionSlot
      extensionSlotName="patient-banner"
      state={{ basePath, patientUuid }}
    />
  );
};

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

  attach("patient-banner", "patient-vital-header-ext");

  useEffect(() => {
    attach("nav-menu", "patient-chart-nav-items");
    return () => detach("nav-menu", "patient-chart-nav-items");
  }, []);

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
            <Route path={basePath} component={PatientInfo} />
          </aside>
          <div className={styles.grid} style={{ marginTop: "4.5rem" }}>
            <div className={styles.chartreview}>
              <Route path={`${basePath}/:view?/:subview?`}>
                <ChartReview />
              </Route>
              <Route
                path={basePath}
                render={routeProps => <VisitDialog {...routeProps} />}
              />
            </div>
            <div className={styles.workspace}>
              <Route
                path={basePath}
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
