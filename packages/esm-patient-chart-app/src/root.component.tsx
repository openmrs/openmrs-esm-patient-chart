import React from "react";
import ContextWorkspace from "./workspace/context-workspace.component";
import PatientChart from "./ui-components/patient-chart/patient-chart.component";
import SideMenu from "./view-components/side-menu.component";
import { BrowserRouter, Route } from "react-router-dom";
import { basePath, dashboardPath, spaRoot } from "./constants";

export default function Root() {
  return (
    <BrowserRouter basename={spaRoot}>
      <SideMenu />
      <Route path={dashboardPath} component={PatientChart} />
      <Route path={basePath} component={ContextWorkspace} />
    </BrowserRouter>
  );
}
