import React, { useState } from "react";
import { match, useLocation } from "react-router";
import styles from "./breadcrumbs.component.css";
import { Link } from "react-router-dom";
import { levelTwoRoutes } from "../level-two-routes.component";
import { getCurrentPatientUuid } from "@openmrs/esm-api";

export function Breadcrumbs(props: any) {
  const { pathname } = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [currentPatientUuid, setCurrentPatientUuid] = useState(null);
  const rootChartUrlObject = {
    url: `/patient/${currentPatientUuid}/chart`,
    name: "Chart"
  };

  React.useEffect(() => {
    getCurrentPatientUuid().subscribe(uuid => {
      setCurrentPatientUuid(uuid);
      const builtBreadcrumbs = [rootChartUrlObject];
      const pathArray = getRouteArray(pathname);
      levelTwoRoutes.forEach(route => {
        const routeArray = getRouteArray(route);
        if (routeArray.every(r => pathArray.includes(r))) {
          route.url = route.url.replace(":patientUuid", currentPatientUuid);
          builtBreadcrumbs.push(route);
        }
      });
      setBreadcrumbs(builtBreadcrumbs);
    });
  }, [pathname, currentPatientUuid]);

  function isActiveRoute(index) {
    return index === breadcrumbs.length - 1;
  }

  function getRouteArray(route) {
    return route
      .substr(pathname.indexOf("/chart"))
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
  location: any;
  match: match;
};
