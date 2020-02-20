import React from "react";
import { Link, useParams, useRouteMatch, useLocation } from "react-router-dom";
import styles from "./chart-review.css";
import Summaries from "./summaries/summaries.component";
import Results from "./results/results.component";
import Orders from "./orders/orders.component";
import Encounters from "./encounters/encounters.component";
import Allergies from "./allergies/allergies.component";
import Conditions from "./conditions/conditions.component";
import Programs from "./programs/programs.component";
import { useConfig } from "@openmrs/esm-module-config";
import Appointment from "./appointments/appointments.component";

export default function ChartReview(props: any) {
  const match = useRouteMatch();
  const location = useLocation();

  const { patientUuid } = useParams();
  const { widget } = useParams();
  const config = useConfig();

  const defaultPath = `/patient/${patientUuid}/chart/`;

  function getConfigWidgets() {
    const w = [];
    return config.widgets.map(widgetName => coreWidgets[widgetName]);
  }

  const coreWidgets = {
    summaries: {
      name: "Summaries",
      path: `summaries`,
      component: () => {
        return <Summaries />;
      }
    },
    results: {
      name: "Results",
      path: `results`,
      component: () => {
        return <Results />;
      }
    },
    orders: {
      name: "Orders",
      path: `orders`,
      component: () => {
        return <Orders />;
      }
    },
    encounters: {
      name: "Encounters",
      path: `encounters`,
      component: () => {
        return <Encounters />;
      }
    },
    conditions: {
      name: "Conditions",
      path: `conditions`,
      component: () => {
        return <Conditions />;
      }
    },
    allergies: {
      name: "Allergies",
      path: `allergies`,
      component: () => {
        return <Allergies />;
      }
    },
    programs: {
      name: "Programs",
      path: `programs`,
      component: () => {
        return <Programs />;
      }
    },
    appointments: {
      name: "Appointments",
      path: `appointments`,
      component: () => {
        return <Appointment />;
      }
    }
  };

  const [widgets, setWidgets] = React.useState(getConfigWidgets());

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
          {widgets.map((item, index) => {
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
      {widgets[selected].component()}
    </>
  );
}
