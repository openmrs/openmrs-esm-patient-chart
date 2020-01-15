import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import openmrsRootDecorator from "@openmrs/react-root-decorator";
import PatientChartSummary from "./summary/patient-chart-summary.component";
import PatientBanner from "./banner/patient-banner.component";
import LevelTwoRoutes from "./summary/level-two-routes.component";

function Root(props) {
  const [widgetRoutes, setWidgetRoutes] = React.useState([]);

  React.useEffect(() => {
    const exampleConfig = [
      {
        name: "Programs",
        esModule: "@jj-widgets",
        exportName: "programsWidget"
      }
    ];

    //placeholder while config mdoule is completed
    const config = [];

    const modulePromises = [];

    config.map(c => {
      if (c["esModule"]) {
        modulePromises.push(System.import(c.esModule));
      }
    });

    //Promise.allSettled(promises) is not supported within zone.js and so we are using the following reflect to achieve the same
    const reflect = p =>
      p.then(
        value => ({ value, status: "fulfilled" }),
        e => ({ e, status: "rejected" })
      );

    //Will need to add error handling but for now, given uncertainty of this feature, holding off.
    Promise.all(modulePromises.map(reflect)).then(modules => {
      const importedWidgets = [];
      let widgetRoutes = [];
      modules.map(m => {
        if (m.status === "fulfilled") {
          for (let [exportName, widget] of Object.entries(m.value.widgets)) {
            if (widget.hasOwnProperty("routes")) {
              widgetRoutes.push(widget["routes"]);
            }
          }
        }
      });
      setWidgetRoutes(widgetRoutes);
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
      {widgetRoutes.length > 0 &&
        widgetRoutes.map((routes, key) => {
          return (
            <Route
              key={key}
              path="/patient/:patientUuid/chart"
              component={routes}
            />
          );
        })}
    </BrowserRouter>
  );
}

export default openmrsRootDecorator({
  featureName: "patient-chart",
  moduleName: "@openmrs/esm-patient-chart"
})(Root);
