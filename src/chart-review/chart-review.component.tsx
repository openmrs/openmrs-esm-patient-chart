import React from "react";
import { Link, useParams, useRouteMatch, useLocation } from "react-router-dom";
import styles from "./chart-review.css";
import { coreWidgets } from "./core-widgets.js";
import { useConfig } from "@openmrs/esm-module-config";

export default function ChartReview(props: any) {
  const match = useRouteMatch();
  const location = useLocation();

  const { patientUuid } = useParams();
  const { widget } = useParams();
  const config = useConfig();

  const defaultPath = `/patient/${patientUuid}/chart`;
  const [widgets, setWidgets] = React.useState([]);

  /*
  const widgetDefinitions = [
    {
      name: "widget",
      label: "Hello", //will be displayed on the nav bar
      esModule: "@jj-widgets", //this module must be in the import map
      path: "/widget" //this will be the path to the widget and will be appended to /patient/:patientUuid/chart
    }
  ] ;
*/

  const [selected, setSelected] = React.useState(getInitialTab());

  React.useEffect(() => {
    const externalWidgets = {};
    const promises = [];
    const moduleMap = {};

    config.widgetDefinitions.map(def => {
      externalWidgets[def.name] = def;

      //only import modules once
      if (moduleMap[def.esModule] === undefined) {
        let p = System.import(def.esModule);
        promises.push(p);
        moduleMap[def.esModule] = p;
      }
    });

    Promise.all(promises).then(modules => {
      const w = [];

      modules.map(mod => {
        moduleMap[mod.name] = mod;
      });

      //config.widgets is an array of widget names
      config.widgets.map(widgetName => {
        //First see if name exists in coreWidgets
        if (coreWidgets[widgetName]) {
          w.push(coreWidgets[widgetName]);
        } else {
          const def = externalWidgets[widgetName];

          let Component = moduleMap[def.esModule].widgets[def.name];
          externalWidgets[widgetName].component = () => <Component />;

          w.push(externalWidgets[widgetName]);
        }
      });

      setWidgets(w);
    });
  }, [config, setWidgets]);

  function getInitialTab() {
    let i;
    if (config == undefined || widgets.length === 0) {
      i = 0;
    } else if (widget == undefined) {
      i = config.defaultTabIndex;
    } else {
      i = widgets.findIndex(element => element.path === "/" + widget);
    }
    return i;
  }

  const [tabHistory, setTabHistory] = React.useState({});

  React.useEffect(() => {
    setTabHistory(t => {
      t[match.params["widget"]] = location.search;
      return t;
    });
  }, [match, location]);

  return (
    <>
      <nav className={styles.topnav} style={{ marginTop: "0" }}>
        <ul>
          {widgets &&
            widgets.map((item, index) => {
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
      {widgets.length > 0 &&
        selected !== undefined &&
        widgets[selected].component()}
    </>
  );
}
