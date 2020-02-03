import React from "react";
import { Route, Link, useHistory, useParams } from "react-router-dom";
import SummariesNav from "../summaries/summaries-nav.component";
import styles from "./top-nav.css";

export default function TopNav(props: any) {
  const [selected, setSelected] = React.useState();
  let history = useHistory();
  const [lastRoute, setLastRoute] = React.useState(history.location.pathname);
  const [paths, setPaths] = React.useState({
    summaries:
      history.location.pathname.indexOf("summaries/") > -1
        ? history.location.pathname
        : ""
  });

  let { patientUuid } = useParams();

  React.useEffect(() => {
    const p = paths;
    if (lastRoute.indexOf("/summaries") > -1) {
      p["summaries"] = lastRoute;
      setPaths(p);
    }
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
      name: "Appointments",
      path: `/patient/${patientUuid}/chart/appointments`
    },
    {
      name: "Vitals",
      path: `/patient/${patientUuid}/chart/vitals`
    },
    {
      name: "Results",
      path: `/patient/${patientUuid}/chart/results`
    },
    {
      name: "Medications",
      path: `/patient/${patientUuid}/chart/medications`
    },
    {
      name: "Notes",
      path: `/patient/${patientUuid}/chart/notes`
    },
    {
      name: "Orders",
      path: `/patient/${patientUuid}/chart/orders`
    }
  ];

  return (
    <>
      <nav className={styles.topnav}>
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

      <div
        style={{
          marginTop: "5.5rem"
        }}
      >
        <Route path="/patient/:patientUuid/chart/summaries">
          <SummariesNav setLastRoute={setLastRoute} paths={paths} />
        </Route>
      </div>
    </>
  );
}
