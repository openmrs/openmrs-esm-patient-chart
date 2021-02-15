import React from "react";
import styles from "./chart-review.css";
import { useParams, Switch, Route, Redirect } from "react-router-dom";
import { useConfig } from "@openmrs/esm-framework";
import { getView, View } from "../view-components/view-utils";
import { ChartConfig } from "../config-schemas/openmrs-esm-patient-chart-schema";

interface IParams {
  patientUuid: string;
  subview: string | undefined;
  view: string;
}

export default function ChartReview() {
  const { patientUuid } = useParams<IParams>();
  const config: ChartConfig = useConfig();

  const defaultPath = `/patient/${patientUuid}/chart`;
  const [views, setViews] = React.useState<View[]>([]);

  React.useEffect(() => {
    const views = config.primaryNavbar.map<View>(item => {
      let view = getView(item.view, config, defaultPath + item.path);

      if (view && view.component) {
        return {
          name: item.view,
          label: item.label,
          path: item.path,
          component: view.component
        };
      }

      return {
        name: item.view,
        label: item.label,
        path: item.path
      };
    });

    // TO DO: Need to handle case where item.component is not a coreWidget
    setViews(views);
  }, [config, defaultPath]);

  return (
    <>
      <div className={styles.chartSection}>
        {views.length > 0 && (
          <Route exact path={defaultPath}>
            <Redirect to={defaultPath + views[0].path} />
          </Route>
        )}

        <Switch>
          {views.map(route => {
            return (
              <Route
                key={route.label}
                path={defaultPath + route.path + "/:subview?"}
              >
                {route.component && route.component()}
              </Route>
            );
          })}
        </Switch>
      </div>
    </>
  );
}
