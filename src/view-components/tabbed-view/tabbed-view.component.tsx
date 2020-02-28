import React, { useState } from "react";
import {
  Route,
  Link,
  Redirect,
  useHistory,
  useParams,
  useLocation,
  Switch,
  useRouteMatch
} from "react-router-dom";

import styles from "./tabbed-view.css";
import { getView, ViewType } from "../view-utils";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function TabbedView(props: any) {
  let { patientUuid } = useParams();
  const [routes, setRoutes] = useState([]);
  const match = useRouteMatch();

  const [selected, setSelected] = React.useState(getInitialTab());

  function getInitialTab() {
    const viewPath = match.url.substr(match.url.lastIndexOf("/"));
    const navItemIndex = props.config.navbar.findIndex(
      element => element.path === viewPath
    );

    return navItemIndex === -1 ? 0 : navItemIndex;
  }

  React.useEffect(() => {
    setRoutes(
      props.config.navbar.map(item => {
        let view = getView(item.view, props.config, props.defaultPath);
        item.component = view.component;
        return item;
      })
    );
  }, [props.config, props.defaultPath]);
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
        {routes.length > 0 && (
          <Route exact path={props.defaultPath}>
            <Redirect to={props.defaultPath + routes[0].path} />
          </Route>
        )}

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
