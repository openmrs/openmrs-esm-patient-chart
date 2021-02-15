import React, { useState } from "react";
import { Route, Link, Redirect, Switch, useRouteMatch } from "react-router-dom";
import { useConfig } from "@openmrs/esm-framework";
import styles from "./tabbed-view.css";
import { getView, View } from "../view-utils";

function getInitialTab(url: string, props: any) {
  const navItemIndex = getNavItemIndex(url, props);
  return navItemIndex === -1 ? 0 : navItemIndex;
}

function getNavItemIndex(url: string, props: any) {
  const viewPath = url.substr(url.lastIndexOf("/"));
  const navItemIndex = props.config.navbar.findIndex(
    element => element.path === viewPath
  );
  return navItemIndex;
}

export default function TabbedView(props: any) {
  const [views, setViews] = useState<Array<View>>([]);
  const match = useRouteMatch();
  const config = useConfig();
  const [selected, setSelected] = React.useState(() =>
    getInitialTab(match.url, props)
  );

  React.useEffect(() => {
    setSelected(getInitialTab(match.url, props));
  }, [match.url]);

  React.useEffect(() => {
    setViews(
      props.config.navbar.map(item => {
        const view = getView(item.view, config, props.defaultPath);

        if (view && view.component) {
          item.component = view.component;
        }

        return item;
      })
    );
  }, [config, props.config, props.defaultPath]);

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
      <div className={styles.routesContainer}>
        {views.length > 0 && (
          <Redirect
            exact
            from={props.defaultPath}
            to={props.defaultPath + views[0].path}
          />
        )}

        <Switch>
          {views.map((route, index) => {
            return (
              <Route
                key={route.label}
                path={`${props.defaultPath + route.path}`}
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
