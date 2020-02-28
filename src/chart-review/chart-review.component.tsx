import React from "react";
import {
  Link,
  useParams,
  useRouteMatch,
  useLocation,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import styles from "./chart-review.css";
import { useConfig } from "@openmrs/esm-module-config";

import { getView } from "../view-components/view-utils";

export default function ChartReview(props: any) {
  const match = useRouteMatch();
  const location = useLocation();

  const { patientUuid } = useParams();
  const { view: viewPath } = useParams();
  const config = useConfig();

  const defaultPath = `/patient/${patientUuid}/chart`;
  const [routes, setRoutes] = React.useState([]);
  const [navbarItems, setNavbarItems] = React.useState([]);

  const [selected, setSelected] = React.useState(getInitialTab());
  const [tabHistory, setTabHistory] = React.useState({});

  function getInitialTab() {
    if (config == undefined || navbarItems.length === 0) {
      return 0;
      //need to rename from widget to something else
    } else if (viewPath == undefined) {
      return config.defaultTabIndex;
    } else {
      return navbarItems.findIndex(element => element.path === "/" + viewPath);
    }
  }

  React.useEffect(() => {
    const routes: ViewType[] = config.primaryNavbar.map(item => {
      let view = getView(item.view, config, defaultPath + item.path);
      item.component = view.component;
      return item;
    });

    // TO DO: Need to handle case where item.component is not a coreWidget
    setNavbarItems(config.primaryNavbar);
    setRoutes(routes);
  }, [config, setRoutes]);

  React.useEffect(() => {
    setTabHistory(t => {
      t[match.params["view"]] = location.pathname;
      return t;
    });
  }, [match, location]);

  React.useEffect(() => {
    setSelected(routes.findIndex(element => element.path === "/" + viewPath));
  }, [routes, viewPath]);

  return (
    <>
      <nav className={styles.topnav} style={{ marginTop: "0" }}>
        <ul>
          {navbarItems &&
            navbarItems.map((item, index) => {
              return (
                <li key={index}>
                  <div
                    className={`${
                      index === selected ? styles.selected : styles.unselected
                    }`}
                  >
                    <Link
                      to={
                        tabHistory[item.path.substr(1)] ||
                        defaultPath + item.path
                      }
                    >
                      <button
                        className="omrs-unstyled"
                        onClick={() => setSelected(index)}
                      >
                        {item.label}
                      </button>
                    </Link>
                  </div>
                </li>
              );
            })}
        </ul>
      </nav>

      {routes.length > 0 && (
        <Route exact path={defaultPath}>
          <Redirect to={defaultPath + routes[0].path} />
        </Route>
      )}

      <Switch>
        {routes.map(route => {
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
    </>
  );
}

type RouteType = {
  name: string;
  path: string;
  component: Function;
};

type ViewType = {
  name: string;
  component: Function;
};
