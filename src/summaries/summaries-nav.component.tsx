import React, { useEffect } from "react";
import PatientChartOverview from "../summaries/overview/patient-chart-overview.component";
import { levelTwoRoutes } from "../summaries/level-two-routes.component";
import { Breadcrumbs } from "../breadcrumbs/breadcrumbs.component";
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

  let i = 0;
  navItems.forEach((item, index) => {
    if (item.path === history.location.pathname) {
      i = index;
    }
  });

  const hasPath = item => item.path.indexOf(history.location.pathname) > -1;
  const [selected, setSelected] = React.useState(navItems.findIndex(hasPath));

  function Hiv(props: any) {
    return <div>Hi</div>;
  }

  /*
  React.useEffect(() => {
    navItems.map((item, index) => {
      if (item.path === history.location.pathname) {
        setSelected(index);
      }
    });
  }, []);
  */

  function handleClick(index, path) {
    setSelected(index);
    props.setLastRoute(path);
  }

  function isSelected(index, path) {
    const isSelected = index === selected || path === props.paths.summaries;

    return isSelected;
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
                    isSelected(index, item.path)
                      ? styles.selected
                      : styles.unselected
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
        {props.paths.summaries === "" ? (
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
