import React from "react";
import ContextWorkspace from "./workspace/context-workspace.component";
import PatientChart from "./ui-components/patient-chart/patient-chart.component";
import { BrowserRouter, Route } from "react-router-dom";
import { dashboardPath, spaRoot } from "./constants";
import { useWorkspace } from "./hooks/useWorkspace";
import { useVisitDialog } from "./hooks/useVisitDialog";
import { useNavMenu } from "./hooks/useNavMenu";

export default function Root() {
  const workspace = useWorkspace();
  useVisitDialog();
  useNavMenu();

  return (
    <BrowserRouter basename={spaRoot}>
      <Route path={dashboardPath} component={PatientChart} />
      <ContextWorkspace {...workspace} />
    </BrowserRouter>
  );
}
