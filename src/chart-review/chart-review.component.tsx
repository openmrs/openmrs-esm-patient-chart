import React from "react";
import { Link, useParams, useRouteMatch, useLocation } from "react-router-dom";
import styles from "./chart-review.css";
import Summaries from "./summaries/summaries.component";
import Results from "./results/results.component";
import History from "./history/history.component";
import Orders from "./orders/orders.component";
import Encounters from "./encounters/encounters.component";

export default function ChartReview(props: any) {
  let match = useRouteMatch();
  let location = useLocation();

  let { patientUuid } = useParams();
  let { widget } = useParams();

  const config = {
    defaultPath: `/patient/${patientUuid}/chart/`,
    defaultTabIndex: 0,
    widgets: [
      {
        name: "Summaries",
        path: `summaries`,
        component: () => {
          return <Summaries />;
        }
      },
      {
        name: "Clinical Hx",
        path: "history",
        component: () => {
          return <History />;
        }
      },

      {
        name: "Results",
        path: `results`,
        component: () => {
          return <Results />;
        }
      },
      {
        name: "Orders",
        path: `orders`,
        component: () => {
          return <Orders />;
        }
      },
      {
        name: "Encounters",
        path: `encounters`,
        component: () => {
          return <Encounters />;
        }
      }
    ]
  };

  const [selected, setSelected] = React.useState(getInitialTab());

  function getInitialTab() {
    return widget == undefined
      ? config.defaultTabIndex
      : config.widgets.findIndex(
          element => element.path === widget
        );
  }

  const [tabHistory, setTabHistory] = React.useState({});

  React.useEffect(() => {
    tabHistory[match.params["widget"]] = location.search;
    setTabHistory(tabHistory);
  }, [match, location]);

  return (
    <>
      <nav className={styles.topnav} style={{ marginTop: "0" }}>
        <ul>
          {config.widgets.map((item, index) => {
            return (
              <li key={index}>
                <div
                  className={`${
                    index === selected ? styles.selected : styles.unselected
                  }`}
                >
                  <Link
                    to={
                      config.defaultPath +
                      item.path +
                      (tabHistory[item.path] || "")
                    }
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
      {config.widgets[selected].component()}
    </>
  );
}
