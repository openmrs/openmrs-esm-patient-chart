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

export default function ChartReview(props: any) {
  const match = useRouteMatch();
  const location = useLocation();

  const { patientUuid } = useParams();
  const { widget } = useParams();

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
      },
      {
        name: "Conditions",
        path: `conditions`,
        component: () => {
          return <Conditions />;
        }
      },
      {
        name: "Allergies",
        path: `allergies`,
        component: () => {
          return <Allergies />;
        }
      },
      {
        name: "Programs",
        path: `programs`,
        component: () => {
          return <Programs />;
        }
      }
    ]
  };

  const [selected, setSelected] = React.useState(getInitialTab());

  function getInitialTab() {
    return widget == undefined
      ? config.defaultTabIndex
      : config.widgets.findIndex(element => element.path === widget);
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
