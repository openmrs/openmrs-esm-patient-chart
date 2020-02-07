import React from "react";
import { Route, Link, Redirect, useHistory, useParams } from "react-router-dom";

import styles from "./chart-widget.css";

export default function Widget(props: any) {
  let { patientUuid } = useParams();
  const history = useHistory();

  const hasPath = item =>
    item.link === history.location.pathname ||
    item.link === props.paths.medications;

  function getInitialSelected() {
    const i = props.widgetConfig.routes.findIndex(hasPath);
    return i === -1 ? 0 : i;
  }

  const [selected, setSelected] = React.useState(getInitialSelected());

  function handleClick(index, path) {
    setSelected(index);
    props.setLastRoute(path);
  }

  return (
    <>
      <nav className={styles.summariesnav} style={{ marginTop: "0" }}>
        <ul>
          {props.widgetConfig.routes.map((item, index) => {
            return (
              <li key={index}>
                <div
                  className={`${
                    index === selected ? styles.selected : styles.unselected
                  }`}
                >
                  <Link to={item.link}>
                    <button
                      className="omrs-unstyled"
                      onClick={() => handleClick(index, item.link)}
                    >
                      {item.name}
                    </button>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>
      <Route
        exact
        path={`/patient/${patientUuid}/chart/${props.widgetConfig.name}`}
      >
        {props.paths[props.widgetConfig.name] === "" ||
        props.paths[props.widgetConfig.name] ===
          `/patient/${patientUuid}/chart/${props.widgetConfig.name}` ? (
          <Redirect
            to={`/patient/${patientUuid}/chart/${props.widgetConfig.name}/${props.widgetConfig.defaultRoute}`}
          />
        ) : (
          <Redirect to={props.paths[props.widgetConfig.name]} />
        )}
      </Route>

      {props.widgetConfig.routes.map((item, index) => {
        return (
          <Route
            key={index}
            exact
            path={item.path}
            component={item.component}
          />
        );
      })}
    </>
  );
}

type WidgetProps = {};
