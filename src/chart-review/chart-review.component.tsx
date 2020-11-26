import React from "react";

import { useParams, Switch, Route, Redirect } from "react-router-dom";
import { useConfig } from "@openmrs/esm-react-utils";

import { ChartConfig } from "../config-schemas/openmrs-esm-patient-chart-schema";
import { getView, View } from "../view-components/view-utils";
import styles from "./chart-review.scss";

function ChartReview(props) {
  const { patientUuid } = useParams<IParams>();
  const config: ChartConfig = useConfig();

  const defaultPath = `/patient/${patientUuid}/chart`;
  const [views, setViews] = React.useState<Array<View>>([]);

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

    setViews(views);
  }, [config, defaultPath]);

  return (
    <div>
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
  );
}

export default ChartReview;

interface IParams {
  patientUuid: string;
  subview: string | undefined;
  view: string;
}
