import React, { useMemo } from "react";
import styles from "./chart-review.css";
import Dashboard from "../view-components/dashboard.component";
import { Switch, Route, Redirect, RouteComponentProps } from "react-router-dom";
import { useConfig } from "@openmrs/esm-framework";
import { ChartConfig, DashboardConfig } from "../config-schemas";
import { basePath } from "../constants";

function makePath(
  target: DashboardConfig,
  params: Record<string, string> = {}
) {
  const parts = `${basePath}/${target.name}/:subview?`.split("/");

  Object.keys(params).forEach(key => {
    for (let i = 0; i < parts.length; i++) {
      if (parts[i][0] === ":" && parts[i].indexOf(key) === 1) {
        parts[i] = params[key];
      }
    }
  });

  return parts.join("/");
}

export default function ChartReview(props: RouteComponentProps) {
  const config = useConfig() as ChartConfig;

  const dashboards = useMemo(() => {
    return config.dashboardDefinitions.map(dashboard => (
      <Route key={dashboard.name} exact path={makePath(dashboard)}>
        <Dashboard {...dashboard} />
      </Route>
    ));
  }, [config.dashboardDefinitions]);

  return (
    <div className={styles.chartSection}>
      <Switch>
        {dashboards.length > 0 && (
          <Route exact path={basePath}>
            <Redirect
              to={makePath(config.dashboardDefinitions[0], {
                ...props.match.params,
                subview: ""
              })}
            />
          </Route>
        )}
        {dashboards}
      </Switch>
    </div>
  );
}
