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
  const [widgets, setWidgets] = React.useState([]);

  const [selected, setSelected] = React.useState(getInitialTab());
  const [tabHistory, setTabHistory] = React.useState({});

  /*
  const widgetDefinitions = [
    {
      name: "widget",
      label: "Hello", //will be displayed on the nav bar
      esModule: "@jj-widgets", //this module must be in the import map
      path: "/widget" //this will be the path to the widget and will be appended to /patient/:patientUuid/chart
    }
  ] ;

  "name": "pih-diabetes-dashboard-1",
                "title": "PIH Diabetes Dashboard 1",
                "layout": {
                    "columnSpan":3
                },
                "widgets": [
                    {
                        "esModule":"@pih-widgets",
                        "name": "diabetes-overview",
                        "layout": {
                            "rowSpan": 1,
                            "columnSpan": 2
                        }
                    },
                    {
                        "esModule":"@pih-widgets",
                        "name":"diabetes-lab-results-summary"
                    }
                ]
*/

  function getInitialTab() {
    if (config == undefined || widgets.length === 0) {
      return 0;
    } else if (widgetPath == undefined) {
      return config.defaultTabIndex;
    } else {
      return widgets.findIndex(element => element.path === "/" + widgetPath);
    }
  }

  const testDD: DashboardConfigType = {
    title: "Test",
    name: "test",
    layout: {
      columns: 3
    },
    widgets: [
      {
        name: "conditions-overview",
        layout: { columnSpan: 2 }
      },
      {
        name: "programs-overview",
        layout: { columnSpan: 2 }
      },
      {
        name: "notes-overview",
        layout: { columnSpan: 4 }
      },
      {
        name: "vitals-overview",
        layout: { columnSpan: 2 }
      },
      {
        name: "height-and-weight-overview",
        layout: { columnSpan: 2 }
      },
      {
        name: "medications-overview",
        layout: { columnSpan: 3 }
      },
      {
        name: "allergy-overview",
        layout: { columnSpan: 1 }
      }
    ]
  };

  React.useEffect(() => {
    const externalWidgets: ExternalWidgetsType = {};
    const promises = [];
    const moduleMap = {};

    config.widgetDefinitions.forEach(def => {
      externalWidgets[def.name] = def;
      //only import modules once
      if (moduleMap[def.esModule] === undefined) {
        promises.push(System.import(def.esModule));
      }
    });

    Promise.all(promises).then(modules => {
      //widgets is an array of objects, see type below
      const widgets: WidgetConfigType[] = [];

      //Promise.all returns an array of resolved modules.
      // Place into an object with key = module name to make it easier to access in the below widget loadinng loop
      modules.map(mod => {
        moduleMap[mod.name] = mod;
      });

      //config.widgets is an array of widget names
      config.widgets.map(widgetName => {
        //First see if name exists in coreWidgets
        if (coreWidgets[widgetName]) {
          widgets.push(coreWidgets[widgetName]);
        } else {
          const widget = externalWidgets[widgetName];
          let Component: FunctionComponent =
            moduleMap[widget.esModule].widgets[widget.name];
          widget.component = () => <Component />;

          widgets.push(widget);
        }
      });

      setWidgets(widgets);
    });
  }, [config, setWidgets]);

  React.useEffect(() => {
    setTabHistory(t => {
      t[match.params["widget"]] = location.search;
      return t;
    });
  }, [match, location]);

  React.useEffect(() => {
    setSelected(
      widgets.findIndex(element => element.path === "/" + widgetPath)
    );
  }, [widgets, widgetPath]);

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
      <Switch>
        {widgets.map(widget => {
          return (
            <Route key={widget.name} path={defaultPath + widget.path}>
              {widget.component()}
            </Route>
          );
        })}
      </Switch>
    </>
  );
}

type ExternalWidgetsType = {
  [key: string]: WidgetConfigType;
};
/*
      {widgets.length > 0 &&
        selected !== undefined &&
        widgets[selected].component()}
*/
