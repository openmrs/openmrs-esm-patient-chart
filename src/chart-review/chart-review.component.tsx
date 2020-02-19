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

  const defaultPath = `/patient/${patientUuid}/chart/`;
  const [widgets, setWidgets] = React.useState();

  const promises = [];
  const moduleMap = {};
  const externalWidgets = {};

  const testDef = 
  {
    name: "Hello",
    esModule: "@jj-widgets",
    path: "hello"
  };


  config.widgetDefinitions.push(testDef);

  config.widgetDefinitions.map((def) => {
    externalWidgets[def.path] = def;
    if(moduleMap[def.esModule]) {
      console.log("doing nothing");
    }
    else {
      promises.push(System.import(def.esModule))        
    }
  });

  Promise.all(promises).then(modules => {
      modules.map((m,i) => {
        moduleMap[m.name] = m;        
      });

      const w = [];
      config.widgets.map(widgetName => {
        if(coreWidgets[widgetName]) { 
          w.push(coreWidgets[widgetName]) 
        }
        else {
          const def = externalWidgets[widgetName];
          const m = moduleMap[externalWidgets[widgetName].esModule];
          let Component = m[def.name];
          externalWidgets[widgetName].component = () => {
            return <Component/>
          }
          w.push(externalWidgets[widgetName])
        }
      });

      setWidgets(w);
  })


  const [selected, setSelected] = React.useState(getInitialTab());

  function getInitialTab() {
    return widget == undefined
      ? config.defaultTabIndex
      : widgets.findIndex(element => element.path === widget);
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
          {widgets && widgets.map((item, index) => {
            return (
              <li key={index}>
                <div
                  className={`${
                    index === selected ? styles.selected : styles.unselected
                  }`}
                >
                  <Link
                    to={defaultPath + item.path + (tabHistory[item.path] || "")}
                  >
                    <button
                      className="omrs-unstyled"
                      onClick={() => setSelected(index)}
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
      {widgets && widgets[selected].component()}
    </>
  );
}
