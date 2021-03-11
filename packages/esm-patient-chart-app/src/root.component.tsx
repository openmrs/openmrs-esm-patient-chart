import React, { useCallback, useEffect, useState } from "react";
import WorkspaceWrapper from "./workspace/workspace-wrapper.component";
import ChartReview from "./chart-review/chart-review.component";
import styles from "./root.css";
import ContextWorkspace from "./workspace/context-workspace.component";
import VisitDialog from "./visit/visit-dialog.component";
import { BrowserRouter, Route, RouteComponentProps } from "react-router-dom";
import {
  attach,
  detach,
  useNavigationContext,
  ExtensionSlot,
  ExtensionSlotProps
} from "@openmrs/esm-framework";
import { AppPropsContext } from "./app-props-context";
import { basePath, dashboardPath, spaRoot } from "./constants";
import { newModalItem } from "./visit/visit-dialog.resource";

interface RouteParams {
  patientUuid: string;
}

const PatientInfo: React.FC<RouteComponentProps<RouteParams>> = props => {
  const patientUuid = props.match.params.patientUuid;
  const basePath = props.location.pathname;
  return (
    <>
      <ExtensionSlot
        extensionSlotName="patient-chart-header"
        state={{ basePath, patientUuid }}
      />
      <ExtensionSlot extensionSlotName="patient-vital-status" />
    </>
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

  useNavigationContext({
    type: "dialog",
    handler: (link: string, state: any) => {
      if (link === "/start-visit") {
        newModalItem(state);
        return true;
      }

      return false;
    }
  });

  useEffect(() => {
    attach("nav-menu", "patient-chart-nav-items");
    return () => detach("nav-menu", "patient-chart-nav-items");
  }, []);

  return (
    <AppPropsContext.Provider value={{ appProps: props }}>
      <BrowserRouter basename={spaRoot}>
        <main
          className="omrs-main-content"
          style={{
            display: "flex",
            alignItems: "flex-start",
            flexDirection: "column"
          }}
        >
          <ExtensionSlot extensionSlotName="breadcrumbs" />
          <aside className={styles.patientBanner} style={{ width: "100%" }}>
            <Route path={basePath} component={PatientInfo} />
          </aside>
          <div className={styles.grid} style={{ marginTop: "4.5rem" }}>
            <div className={styles.chartreview}>
              <Route path={dashboardPath} component={ChartReview} />
              <Route path={basePath} component={VisitDialog} />
            </div>
            <div className={styles.workspace}>
              <Route path={basePath} component={WorkspaceWrapper} />
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
