import React, { useState } from "react";
import { match } from "react-router";
import styles from "./breadcrumbs.component.css";

export function Breadcrumbs(props: BreadcrumbsProps) {
  const [breadcrumbRoutes, setBreadcrumbRoutes] = useState([]);

  React.useEffect(() => {
    const path = props.match.url.substr(props.match.url.indexOf("chart"));
    setBreadcrumbRoutes(path.split("/"));
  }, [props.match.url]);

  function isActiveRoute(index) {
    return index === breadcrumbRoutes.length - 1;
  }

  return (
    <div className={styles.wrapper}>
      {breadcrumbRoutes.map((route, index) => {
        return (
          <div className={styles.route}>
            <span
              className={isActiveRoute(index) ? styles.active : styles.inactive}
            >
              {route}
            </span>
            {!isActiveRoute(index) && (
              <svg
                className="omrs-icon"
                fill="var(--omrs-color-ink-medium-contrast)"
              >
                <use xlinkHref="#omrs-icon-chevron-right"></use>
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}

type BreadcrumbsProps = {
  location: any;
  match: match;
};
