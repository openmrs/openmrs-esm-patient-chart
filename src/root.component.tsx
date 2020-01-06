import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import openmrsRootDecorator from "@openmrs/react-root-decorator";
import PatientChartSummary from "./summary/patient-chart-summary.component";
import PatientBanner from "./banner/patient-banner.component";
import LevelTwoRoutes from "./summary/level-two-routes.component";

function Root(props) {
  const [widgets, setWidgets] = React.useState([]);
  const [routes, setRoutes] = React.useState([]);

  React.useEffect(() => {
    System.import("@jj-widgets").then(m => {
      setWidgets(m.widgets);
      setRoutes(m.widgets[0].routes);
    });
  }, []);

  return (
    <BrowserRouter basename={window["getOpenmrsSpaBase"]()}>
      <Route path="/patient/:patientUuid/chart">
        <PatientBanner match={props.match} />
      </Route>
      <Route
        path="/patient/:patientUuid/chart"
        exact
        component={PatientChartSummary}
      />
      <Route path="/patient/:patientUuid/chart" component={LevelTwoRoutes} />

      {routes && routes}
    </BrowserRouter>
  );
}

export default openmrsRootDecorator({
  featureName: "patient-chart",
  moduleName: "@openmrs/esm-patient-chart"
})(Root);
