import React, { useMemo } from "react";
import styles from "./chart-review.css";
import GridView from "../view-components/grid-view.component";
import TabbedView from "../view-components/tabbed-view.component";
import { Switch, Route, Redirect, RouteComponentProps } from "react-router-dom";
import { useConfig } from "@openmrs/esm-framework";
import { ChartConfig, DashboardConfig } from "../config-schemas";
import { basePath } from "../constants";

function makePath(
  target: DashboardConfig,
  params: Record<string, string> = {}
) {
  const parts = `${basePath}/${target.name}/:subview?`.split("/");

  Object.keys(params).forEach((key) => {
    for (let i = 0; i < parts.length; i++) {
      if (parts[i][0] === ":" && parts[i].indexOf(key) === 1) {
        parts[i] = params[key];
      }
    }
  });

  return parts.join("/");
}

interface ChartReviewProps
  extends RouteComponentProps<{ patientUuid: string }> {}

const ChartReview: React.FC<ChartReviewProps> = ({ match }) => {
  const config = useConfig() as ChartConfig;
  const { patientUuid } = match.params;

  const dashboards = useMemo(() => {
    return config.dashboardDefinitions.map((dashboard) => (
      <Route key={dashboard.name} exact path={makePath(dashboard)}>
        {dashboard.config.type === "grid" ? (
          <GridView
            slot={dashboard.slot}
            layout={dashboard.config}
            name={dashboard.name}
            patientUuid={patientUuid}
          />
        ) : (
          <TabbedView
            slot={dashboard.slot}
            layout={dashboard.config}
            name={dashboard.name}
            patientUuid={patientUuid}
          />
        )}
      </Route>
    ));
  }, [config.dashboardDefinitions, patientUuid]);

  return (
    <div className={styles.chartSection}>
      <div className={styles.container}>
        <Switch>
          {dashboards.length > 0 && (
            <Route exact path={basePath}>
              <Redirect
                to={makePath(config.dashboardDefinitions[0], {
                  ...match.params,
                  subview: "",
                })}
              />
            </Route>
          )}
          {dashboards}
        </Switch>
      </div>
    </div>
  );
};

export default ChartReview;
