import React from "react";

import { Link, useParams, useRouteMatch, useLocation } from "react-router-dom";
import { useConfig } from "@openmrs/esm-react-utils";
import { VisitButton } from "@openmrs/esm-patient-chart-widgets";

import {
  ChartConfig,
  Navbar
} from "../config-schemas/openmrs-esm-patient-chart-schema";
import styles from "./top-nav.css";

function TopNav() {
  const match = useRouteMatch();
  const location = useLocation();
  const config: ChartConfig = useConfig();
  const { patientUuid, view: viewPath } = useParams<IParams>();
  const defaultPath = `/patient/${patientUuid}/chart`;

  const navRef = React.useRef(null);
  const [navbarItems, setNavbarItems] = React.useState<Navbar[]>([]);
  const [selected, setSelected] = React.useState(getInitialTab());
  const [tabHistory, setTabHistory] = React.useState({});
  const navItemRefs = navbarItems.reduce((acc, value) => {
    acc[navbarItems.indexOf(value)] = React.createRef();
    return acc;
  }, {});

  React.useEffect(() => {
    // TODO: Need to handle case where item.component is not a coreWidget
    setNavbarItems(config.primaryNavbar);
  }, [config, defaultPath]);

  React.useEffect(() => {
    setTabHistory(t => {
      t[match.params["view"]] = location.pathname;
      return t;
    });
  }, [match, location]);

  function getInitialTab() {
    if (
      config === undefined ||
      navbarItems.length === 0 ||
      viewPath === undefined
    ) {
      return 0;
    } else {
      return navbarItems.findIndex(element => element.path === "/" + viewPath);
    }
  }

  return (
    <div className={styles.navContainer}>
      <nav ref={navRef} className={styles.topnav}>
        <ul>
          {navbarItems &&
            navbarItems.map((item, index) => {
              return (
                <li key={index} ref={navItemRefs[index]}>
                  <div
                    className={`${
                      index === selected ? styles.selected : styles.unselected
                    }`}
                  >
                    <Link
                      to={
                        tabHistory[item.path.substr(1)] ||
                        defaultPath + item.path
                      }
                    >
                      <button
                        className="omrs-unstyled"
                        id={"nav_item" + index}
                        onClick={() => setSelected(index)}
                      >
                        {(item.label, item.label)}
                      </button>
                    </Link>
                  </div>
                </li>
              );
            })}
        </ul>
        <VisitButton />
      </nav>
    </div>
  );
}

export default TopNav;

interface IParams {
  patientUuid: string;
  subview: string | undefined;
  view: string;
}
