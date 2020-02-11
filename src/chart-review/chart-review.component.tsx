import React from "react";
import { Route, Link, useHistory, useParams } from "react-router-dom";
import styles from "./chart-review.css";
import Summaries from "../summaries/summaries.component";
import Results from "./results/results.component";
import History from "./history/history.component";
import Orders from "./orders/orders.component";

export default function ChartReview(props: any) {
  const [selected, setSelected] = React.useState();
  let history = useHistory();
  const [lastRoute, setLastRoute] = React.useState(history.location.pathname);
  const [paths, setPaths] = React.useState({
    summaries: history.location.pathname.includes("summaries/")
      ? history.location.pathname
      : "",
    history: history.location.pathname.includes("history/")
      ? history.location.pathname
      : "",
    results: history.location.pathname.includes("results/")
      ? history.location.pathname
      : "",
    orders: history.location.pathname.includes("orders/")
      ? history.location.pathname
      : ""
  });

  let { patientUuid } = useParams();

  React.useEffect(() => {
    switch (true) {
      case lastRoute.includes("/summaries"):
        paths["summaries"] = lastRoute;
        break;
      case lastRoute.includes("/history"):
        paths["history"] = lastRoute;
        break;
      case lastRoute.includes("/results"):
        paths["results"] = lastRoute;
        break;
      case lastRoute.includes("/orders"):
        paths["orders"] = lastRoute;
        break;
    }
    setPaths(paths);
  }, [lastRoute, paths]);

  function handleClick() {
    setLastRoute(history.location.pathname);
  }

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
      name: "Notes",
      path: `/patient/${patientUuid}/chart/notes`
    },
    {
      name: "Appointments",
      path: `/patient/${patientUuid}/chart/appointments`
    }
  ];

  return (
    <>
      <nav className={styles.topnav} style={{ marginTop: "0" }}>
        <ul>
          {navItems.map((item, index) => {
            return (
              <li key={index}>
                <div
                  className={`${
                    index === selected ||
                    history.location.pathname.indexOf(item.path) > -1
                      ? styles.selected
                      : styles.unselected
                  }`}
                >
                  <Link to={item.path}>
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

      <Route path="/patient/:patientUuid/chart/summaries">
        <Summaries setLastRoute={setLastRoute} paths={paths} />
      </Route>

      <Route path="/patient/:patientUuid/chart/history">
        <History setLastRoute={setLastRoute} paths={paths} />
      </Route>

      <Route path="/patient/:patientUuid/chart/orders">
        <Orders setLastRoute={setLastRoute} paths={paths} />
      </Route>

      <Route path="/patient/:patientUuid/chart/results">
        <Results setLastRoute={setLastRoute} paths={paths} />
      </Route>

      <Route path="/patient/:patientUuid/chart/orders"></Route>
    </>
  );
}
