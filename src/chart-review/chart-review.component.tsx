import React from "react";
import {
  Route,
  Link,
  useHistory,
  useParams,
  useRouteMatch,
  useLocation
} from "react-router-dom";
import styles from "./chart-review.css";
import Summaries from "./summaries/summaries.component";
import Results from "./results/results.component";
import History from "./history/history.component";
import Orders from "./orders/orders.component";
import Encounters from "./encounters/encounters.component";

export default function ChartReview(props: any) {
  let history = useHistory();
  const [lastRoute, setLastRoute] = React.useState(history.location.pathname);
  let match = useRouteMatch();
  let location = useLocation();

  let { patientUuid } = useParams();
  let { widget } = useParams();

  const navItems = [
    {
      name: "Summaries",
      path: `/patient/${patientUuid}/chart/summaries`
    },
    {
      name: "Clinical Hx",
      path: `/patient/${patientUuid}/chart/history`
    },

    {
      name: "Results",
      path: `/patient/${patientUuid}/chart/results`
    },
    {
      name: "Orders",
      path: `/patient/${patientUuid}/chart/orders`
    },
    {
      name: "Encounters",
      path: `/patient/${patientUuid}/chart/encounters`
    }
  ];

  const [selected, setSelected] = React.useState(getInitialTab());

  function getInitialTab() {
    return widget == undefined
      ? 0
      : navItems.findIndex(element => element.name.toLowerCase() === widget);
  }

  const [paths, setPaths] = React.useState({});

  React.useEffect(() => {
    paths[match.params["widget"]] = location.search;
    setPaths(paths);
  }, [match, location]);

  const widgets = {
    summaries: () => {
      return <Summaries paths={paths} setLastRoute={setLastRoute} />;
    },
    history: () => {
      return <History paths={paths} setLastRoute={setLastRoute} />;
    },
    results: () => {
      return <Results paths={paths} setLastRoute={setLastRoute} />;
    },
    orders: () => {
      return <Orders paths={paths} setLastRoute={setLastRoute} />;
    },
    encounters: () => {
      return <Encounters />;
    }
  };

  return (
    <>
      <nav className={styles.topnav} style={{ marginTop: "0" }}>
        <ul>
          {navItems.map((item, index) => {
            return (
              <li key={index}>
                <div
                  className={`${
                    index === selected ? styles.selected : styles.unselected
                  }`}
                >
                  <Link to={item.path + (paths[item.name.toLowerCase()] || "")}>
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

      {widget == undefined ? widgets.summaries() : widgets[widget]()}
    </>
  );
}
