import React, { FunctionComponent } from "react";
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
import Dashboard, {
  DashboardConfigType,
  WidgetConfigType
} from "../ui-components/dashboard/dashboard.component";
import { coreWidgets, coreDashboards } from "../ui-components/core-views";
import Widget from "../ui-components/widget/widget.component";

export default function ChartReview(props: any) {
  const match = useRouteMatch();
  const location = useLocation();

  const { patientUuid } = useParams();
  const { widget: widgetPath } = useParams();
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
    } else if (widgetPath == undefined) {
      return config.defaultTabIndex;
    } else {
      return navbarItems.findIndex(
        element => element.path === "/" + widgetPath
      );
    }
  }

  function getCoreView(name: string): ViewType {
    if (coreWidgets[name]) {
      return coreWidgets[name];
    }
    if (coreDashboards[name]) {
      return {
        ...coreDashboards[name],
        component: () => (
          <Dashboard key={name} dashboardConfig={coreDashboards[name]} />
        )
      };
    }
    return;
    //TODO: if(coreMultiDashboards[view])
  }

  function getExternalView(config, name: string): ViewType {
    let i = config.widgetDefinitions.findIndex(item => item.name === name);
    let view: ViewType = { name: name, component: null };
    if (i !== -1) {
      view.component = () => (
        <Widget widgetConfig={config.widgetDefinitions[i]} />
      );
    }
    i = config.dashboardDefinitions.findIndex(
      dashboardDefinition => dashboardDefinition.name === name
    );

    if (i !== -1) {
      view.component = () => (
        <Dashboard dashboardConfig={config.dashboardDefinitions[i]} />
      );
    }
    return view;
  }

  React.useEffect(() => {
    const routes: ViewType[] = config.primaryNavBar.map(item => {
      let view = getCoreView(item.view);

      if (view === undefined) {
        view = getExternalView(config, item.view);
      }
      item.component = view.component;
      return item;
    });

    // TO DO: Need to handle case where item.component is not a coreWidget
    setNavbarItems(config.primaryNavBar);
    setRoutes(routes);
  }, [config, setRoutes]);

  React.useEffect(() => {
    setTabHistory(t => {
      t[match.params["widget"]] = location.search;
      return t;
    });
  }, [match, location]);

  React.useEffect(() => {
    setSelected(routes.findIndex(element => element.path === "/" + widgetPath));
  }, [routes, widgetPath]);

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
                        defaultPath + item.path + (tabHistory[item.path] || "")
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
            <Route key={route.name} path={defaultPath + route.path}>
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
