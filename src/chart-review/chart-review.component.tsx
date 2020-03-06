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

import { getView, View } from "../view-components/view-utils";
import { ChartConfig, Navbar } from "../root.component";

export default function ChartReview(props: any) {
  const match = useRouteMatch();
  const location = useLocation();

  const { patientUuid } = useParams();
  const { view: viewPath } = useParams();
  const config = useConfig<ChartConfig>();
  const defaultPath = `/patient/${patientUuid}/chart`;
  const [views, setViews] = React.useState<View[]>([]);
  const [navbarItems, setNavbarItems] = React.useState<Navbar[]>([]);

  const [selected, setSelected] = React.useState(getInitialTab());
  const [tabHistory, setTabHistory] = React.useState({});

  function getInitialTab() {
    if (
      config === undefined ||
      navbarItems.length === 0 ||
      viewPath === undefined
    ) {
      return 0;
    } else {
      return navbarItems.findIndex(element => element.path === "/" + viewPath);
    }
  }

  React.useEffect(() => {
    const views: View[] = config.primaryNavbar.map(item => {
      let view = getView(item.view, config, defaultPath + item.path);
      if (view && view.component) item.component = view.component;
      return item;
    });

    // TO DO: Need to handle case where item.component is not a coreWidget
    setNavbarItems(config.primaryNavbar);
    setViews(views);
  }, [config, setViews, defaultPath]);

  React.useEffect(() => {
    setTabHistory(t => {
      t[match.params["view"]] = location.pathname;
      return t;
    });
  }, [match, location]);

  React.useEffect(() => {
    setSelected(views.findIndex(element => element.path === "/" + viewPath));
  }, [views, viewPath]);

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
    </>
  );
}
