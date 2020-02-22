import React, { FunctionComponent } from "react";
import {
  Link,
  useParams,
  useRouteMatch,
  useLocation,
  Switch,
  Route
} from "react-router-dom";
import styles from "./chart-review.css";
import { useConfig } from "@openmrs/esm-module-config";
import Dashboard, {
  DashboardConfigType,
  WidgetConfigType
} from "../ui-components/dashboard/dashboard.component";
import { coreWidgets } from "../widgets/core-widgets";

export default function ChartReview(props: any) {
  const match = useRouteMatch();
  const location = useLocation();

  const { patientUuid } = useParams();
  const { widget: widgetPath } = useParams();
  const config = useConfig();

  const defaultPath = `/patient/${patientUuid}/chart`;
  const [views, setViews] = React.useState([]);
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

  React.useEffect(() => {
    const views = [];
    config.primaryNavBar.forEach(item => {
      if (coreWidgets[item.component]) {
        views.push(coreWidgets[item.component]);
      }
      // TO DO: Need to handle case where item.component is not a coreWidget
      setNavbarItems(config.primaryNavBar);
      setViews(views);
    });
  }, [config, setViews]);

  React.useEffect(() => {
    setTabHistory(t => {
      t[match.params["widget"]] = location.search;
      return t;
    });
  }, [match, location]);

  React.useEffect(() => {
    setSelected(views.findIndex(element => element.path === "/" + widgetPath));
  }, [views, widgetPath]);

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
      <Switch>
        {views.map(view => {
          return (
            <Route key={view.name} path={defaultPath + view.path}>
              {view.component()}
            </Route>
          );
        })}
      </Switch>
    </>
  );
}
