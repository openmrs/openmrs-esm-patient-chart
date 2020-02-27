import React, { useState } from "react";
import {
  Route,
  Link,
  Redirect,
  useHistory,
  useParams,
  useLocation,
  Switch
} from "react-router-dom";

import styles from "./multi-dashboard.css";
import { getView, ViewType } from "../view-utils";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function MultiDashboard(props: any) {
  let { patientUuid } = useParams();
  const [routes, setRoutes] = useState([]);
  const { view: viewPath } = useParams();
  const { subView: tabPath } = useParams();

  const [selected, setSelected] = React.useState(getInitialTab());

  function getInitialTab() {
    const navItem = props.config.navbar.findIndex(
      element => element.name === tabPath
    );
    return navItem === -1 ? 0 : navItem;
  }

  React.useEffect(() => {
    setRoutes(
      props.config.navbar.map(item => {
        let view = getView(item.view, props.config, props.defaultPath);
        item.component = view.component;
        return item;
      })
    );
  }, [props.config]);
  return (
    <>
      <nav className={styles.summariesnav} style={{ marginTop: "0" }}>
        <ul>
          {props.config.navbar.map((item, index) => {
            return (
              <li key={index}>
                <div
                  className={`${
                    index === selected ? styles.selected : styles.unselected
                  }`}
                >
                  <Link to={props.defaultPath + item.path}>
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
      <div style={{ margin: "21px" }}>
        <Switch>
          {routes.map((route, index) => {
            return (
              <Route
                key={route.label}
                exact
                path={props.defaultPath + route.path}
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
