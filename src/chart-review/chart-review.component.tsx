import React from "react";
import { Route, Link, useHistory, useParams } from "react-router-dom";
import SummariesNav from "../summaries/summaries-nav.component";
import LevelTwoRoutes from "./level-two-routes.component";
import styles from "./chart-review.css";
import { newWorkspaceItem } from "../workspace/workspace.resource";
import { MedicationOrderBasket } from "../widgets/medications/medication-order-basket.component";
import Medications from "../widgets/medications/medications.component";
import Vitals from "../widgets/vitals/vitals.component";

export default function ChartReview(props: any) {
  const [selected, setSelected] = React.useState();
  let history = useHistory();
  const [lastRoute, setLastRoute] = React.useState(history.location.pathname);
  const [paths, setPaths] = React.useState({
    summaries: history.location.pathname.includes("summaries/")
      ? history.location.pathname
      : "",
    medications: history.location.pathname.includes("medications/")
      ? history.location.pathname
      : "",
    vitals: history.location.pathname.includes("vitals/")
      ? history.location.pathname
      : ""
  });

  let { patientUuid } = useParams();

  React.useEffect(() => {
    switch (true) {
      case lastRoute.includes("/summaries"):
        paths["summaries"] = lastRoute;
        break;
      case lastRoute.includes("/medications"):
        paths["medications"] = lastRoute;
        break;
    }
    setPaths(paths);
  }, [lastRoute, paths]);

  function handleClick() {
    setLastRoute(history.location.pathname);
  }

  function showOrders() {
    newWorkspaceItem({
      component: MedicationOrderBasket,
      name: "Medication Order Basket",
      props: { match: { params: {} } },
      inProgress: false
    });
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
    },
    {
      name: "Conditions",
      path: `/patient/${patientUuid}/chart/conditions`
    },
    {
      name: "Programs",
      path: `/patient/${patientUuid}/chart/programs`
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
        <SummariesNav setLastRoute={setLastRoute} paths={paths} />
      </Route>
      <Route path="/patient/:patientUuid/chart" component={LevelTwoRoutes} />
      <Route path="/patient/:patientUuid/chart/medications">
        <Medications setLastRoute={setLastRoute} paths={paths} />
      </Route>

      <Route path="/patient/:patientUuid/chart/vitals">
        <Vitals setLastRoute={setLastRoute} paths={paths} />
      </Route>

      <Route path="/patient/:patientUuid/chart/orders">
        <div>
          <button
            className="omrs-unstyled"
            onClick={showOrders}
            style={{ padding: "1rem", width: "100%" }}
          >
            Create Orders
          </button>
        </div>
      </Route>
    </>
  );
}
