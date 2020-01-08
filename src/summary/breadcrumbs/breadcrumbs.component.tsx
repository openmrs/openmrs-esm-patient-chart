import React, { useState } from "react";
import { useLocation } from "react-router";
import styles from "./breadcrumbs.component.css";
import { Link } from "react-router-dom";
import { getCurrentPatientUuid } from "@openmrs/esm-api";
import { PatientChartRoute } from "../level-two-routes.component";

export function Breadcrumbs(props: BreadcrumbsProps) {
  const { pathname } = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [currentPatientUuid, setCurrentPatientUuid] = useState(null);

  React.useEffect(() => {
    getCurrentPatientUuid().subscribe(uuid => {
      setCurrentPatientUuid(uuid);
      const firstPath = insertPatientUuid(props.rootUrl);
      const builtBreadcrumbs = [firstPath];
      const locationPathnames = getPathArray(pathname);
      props.routes.forEach(route => {
        const paths = getPathArray(route.url);
        if (isSubset(paths, locationPathnames)) {
          const path = insertPatientUuid(route);
          builtBreadcrumbs.push(path);
        }
      });
      setBreadcrumbs(builtBreadcrumbs);
    });

    function insertPatientUuid(route) {
      route.url = currentPatientUuid
        ? route.url.replace(":patientUuid", currentPatientUuid)
        : route.url;
      return route;
    }
  }, [pathname, currentPatientUuid, props.rootUrl, props.routes]);

  function isActiveRoute(index) {
    return index === breadcrumbs.length - 1;
  }

  function isSubset(arr, target) {
    return arr.every(r => (r.startsWith(":") ? true : target.includes(r)));
  }

  function getPathArray(route) {
    return route
      .substr(route.indexOf("/chart"))
      .split("/")
      .filter(path => path.length > 0);
  }

  return (
    <div className={styles.wrapper}>
      {breadcrumbs.length > 1 &&
        breadcrumbs.map((route, index) => {
          return (
            <li className={styles.route} key={index}>
              <Link
                to={route.url}
                className={`${styles.breadcrumb} ${
                  isActiveRoute(index) ? styles.active : styles.inactive
                }`}
              >
                {route.name}
              </Link>
              {!isActiveRoute(index) && (
                <div>
                  <svg
                    className="omrs-icon"
                    fill="var(--omrs-color-ink-medium-contrast)"
                  >
                    <use xlinkHref="#omrs-icon-chevron-right"></use>
                  </svg>
                </div>
              )}
            </li>
          );
        })}
    </div>
  );
}

type BreadcrumbsProps = {
  rootUrl: { name: string; url: string };
  routes: PatientChartRoute[];
};
