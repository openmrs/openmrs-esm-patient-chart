import React, { useMemo } from "react";
import styles from "./chart-review.css";
import { Switch, Route, Redirect } from "react-router-dom";
import { useConfig } from "@openmrs/esm-framework";
import { ChartConfig } from "../config-schemas/openmrs-esm-patient-chart-schema";
import { DashboardConfig } from "../view-components/core-views";
import Dashboard from "../view-components/dashboard/dashboard.component";

const defaultPath = `/patient/:patientUuid/chart`;

function makePath(target: DashboardConfig) {
  return `${defaultPath}/${target.name}/:subview?`;
}

export default function ChartReview() {
  const config = useConfig() as ChartConfig;
  const dashboards = useMemo(() => {
    return config.dashboardDefinitions.map(dashboard => (
      <Route key={dashboard.name} exact path={makePath(dashboard)}>
        <Dashboard dashboardConfig={dashboard} />
      </Route>
    ));
  }, [config.dashboardDefinitions]);

  return (
    <>
      <div className={styles.chartSection}>
        <Switch>
          {dashboards.length > 0 && (
            <Route exact path={defaultPath}>
              <Redirect to={makePath(config.dashboardDefinitions[0])} />
            </Route>
          )}
          {dashboards}
        </Switch>
      </div>
    </>
  );
}
