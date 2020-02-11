import React, { useEffect } from "react";
import PatientChartOverview from "./overview/patient-chart-overview.component";
import { levelTwoRoutes } from "../level-two-routes.component";
import { Breadcrumbs } from "../../breadcrumbs/breadcrumbs.component";
import { Route, Link, Redirect, useHistory, useParams } from "react-router-dom";
import styles from "./summaries-nav.css";
import { RouteComponentProps } from "react-router";

export default function SummariesNav(props: any) {
  let { patientUuid } = useParams();
  const history = useHistory();

  const navItems = [
    {
      name: "Overview",
      path: `/patient/${patientUuid}/chart/summaries/overview`
    },

    {
      name: "HIV",
      path: `/patient/${patientUuid}/chart/summaries/hiv`
    }
  ];

  const hasPath = item =>
    item.path === history.location.pathname ||
    item.path === props.paths.summaries;

  function getInitialSelected() {
    const i = navItems.findIndex(hasPath);
    return i === -1 ? 0 : i;
  }

  const [selected, setSelected] = React.useState(getInitialSelected());

  function Hiv(props: any) {
    return <div>Hi</div>;
  }

  function handleClick(index, path) {
    setSelected(index);
    props.setLastRoute(path);
  }

  return (
    <>
      <nav className={styles.summariesnav} style={{ marginTop: "0" }}>
        <ul>
          {navItems.map((item, index) => {
            return (
              <li key={index}>
                <div
                  className={`${
                    index === selected ? styles.selected : styles.unselected
                  }`}
                >
                  <Link to={item.path}>
                    <button
                      className="omrs-unstyled"
                      onClick={() => handleClick(index, item.path)}
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

      <Route exact path="/patient/:patientUuid/chart/summaries">
        {props.paths.summaries === "" ||
        props.paths.summaries === `/patient/${patientUuid}/chart/summaries` ? (
          <Redirect to={`/patient/${patientUuid}/chart/summaries/overview`} />
        ) : (
          <Redirect to={props.paths.summaries} />
        )}
      </Route>

      <Route path="/patient/:patientUuid/chart/summaries">
        <Breadcrumbs
          rootUrl={getPatientChartRootUrl()}
          routes={levelTwoRoutes}
        />
      </Route>

      <Route
        exact
        path="/patient/:patientUuid/chart/summaries/overview"
        component={PatientChartOverview}
      />

      <Route exact path="/patient/:patientUuid/chart/summaries/hiv">
        <Hiv />
      </Route>
    </>
  );
}

function getPatientChartRootUrl() {
  return {
    url: "/patient/:patientUuid/chart/summaries",
    name: "Chart"
  };
}
