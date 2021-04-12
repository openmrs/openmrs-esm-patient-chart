import React from "react";
import ContextWorkspace from "./workspace/context-workspace.component";
import PatientChart from "./ui-components/patient-chart/patient-chart.component";
import { BrowserRouter, Route } from "react-router-dom";
import { basePath, dashboardPath, spaRoot } from "./constants";
import { useNavMenu } from "./hooks/useNavMenu";

export default function Root() {
  useNavMenu();

  return (
    <BrowserRouter basename={spaRoot}>
      <Route path={dashboardPath} component={PatientChart} />
      <Route path={basePath} component={ContextWorkspace} />
    </BrowserRouter>
  );
}
