import React, { useRef } from "react";
import {
  Link,
  useParams,
  useRouteMatch,
  useLocation,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import styles from "./chart-review.css";
import { useConfig } from "@openmrs/esm-module-config";

import { getView, View } from "../view-components/view-utils";
import { ChartConfig, Navbar } from "../root.component";

export default function ChartReview(props: any) {
  const match = useRouteMatch();
  const location = useLocation();

  const { patientUuid } = useParams();
  const { view: viewPath } = useParams();
  const config = useConfig<ChartConfig>();
  const defaultPath = `/patient/${patientUuid}/chart`;
  const [views, setViews] = React.useState<View[]>([]);
  const [navbarItems, setNavbarItems] = React.useState<Navbar[]>([]);

  const [selected, setSelected] = React.useState(getInitialTab());
  const [tabHistory, setTabHistory] = React.useState({});

  // NAV HEADER
  const [navHeaderOverflowed, setNavHeaderOverflowed] = React.useState(false);
  const [leftHeaderPagerVisible, setLeftHeaderPagerVisible] = React.useState(
    false
  );
  const [rightHeaderPagerVisible, setRightHeaderPagerVisible] = React.useState(
    true
  );
  const navRef = useRef(null);
  const navItemsRefs = navbarItems.reduce((acc, value) => {
    acc[navbarItems.indexOf(value)] = React.createRef();
    return acc;
  }, {});

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

  React.useEffect(() => {
    const views: View[] = config.primaryNavbar.map(item => {
      let view = getView(item.view, config, defaultPath + item.path);
      if (view && view.component) {
        item.component = view.component;
      }
      return item;
    });

    // TO DO: Need to handle case where item.component is not a coreWidget
    setNavbarItems(config.primaryNavbar);
    setViews(views);
  }, [config, setViews, defaultPath]);

  React.useEffect(() => {
    setTabHistory(t => {
      t[match.params["view"]] = location.pathname;
      return t;
    });
  }, [match, location]);

  React.useEffect(() => {
    setSelected(views.findIndex(element => element.path === "/" + viewPath));
  }, [views, viewPath]);

  const onNavHeaderScrolled = () => {
    if (navRef.current.scrollLeft === 0) {
      setLeftHeaderPagerVisible(false);
    } else {
      setLeftHeaderPagerVisible(true);
    }

    if (
      navRef.current.scrollLeft + navRef.current.clientWidth + 50 >=
      navRef.current.scrollWidth
    ) {
      setRightHeaderPagerVisible(false);
    } else {
      setRightHeaderPagerVisible(true);
    }
  };

  const scrollToItem = id => {
    if (navItemsRefs[id]) {
      navItemsRefs[id].current.scrollIntoView({
        behavior: "smooth",
        block: "end"
      });
    }
  };

  React.useEffect(() => {
    scrollToItem(selected);
  }, [selected]);

  const nextPage = () => {
    navRef.current.scrollLeft =
      navRef.current.scrollLeft + navRef.current.clientWidth;
  };

  const previousPage = () => {
    navRef.current.scrollLeft =
      navRef.current.scrollLeft - navRef.current.clientWidth;
  };

  const checkForOverflow = () => {
    if (
      navRef &&
      navRef.current &&
      navRef.current.scrollWidth - navRef.current.clientWidth > 0
    ) {
      if (!navHeaderOverflowed) setNavHeaderOverflowed(true);
    } else {
      if (navHeaderOverflowed) setNavHeaderOverflowed(false);
    }
  };
  checkForOverflow();
  return (
    <>
      <div className={styles.navContainer}>
        {navHeaderOverflowed && leftHeaderPagerVisible && (
          <button
            className={styles.leftHeaderPagination}
            onClick={previousPage}
          >
            <svg
              className="omrs-icon omrs-type-body-regular"
              fill="var(--omrs-color-ink-medium-contrast)"
            >
              <use xlinkHref="#omrs-icon-arrow-back"></use>
            </svg>
          </button>
        )}
        <nav
          onScroll={onNavHeaderScrolled}
          ref={navRef}
          className={styles.topnav}
        >
          <ul>
            {navbarItems &&
              navbarItems.map((item, index) => {
                return (
                  <li key={index} ref={navItemsRefs[index]}>
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
                          {item.label}
                        </button>
                      </Link>
                    </div>
                  </li>
                );
              })}
          </ul>
        </nav>
        {navHeaderOverflowed && rightHeaderPagerVisible && (
          <button className={styles.rightHeaderPagination} onClick={nextPage}>
            <svg
              className="omrs-icon omrs-type-body-regular"
              fill="var(--omrs-color-ink-medium-contrast)"
            >
              <use xlinkHref="#omrs-icon-arrow-forward"></use>
            </svg>
          </button>
        )}
      </div>
      {views.length > 0 && (
        <Route exact path={defaultPath}>
          <Redirect to={defaultPath + views[0].path} />
        </Route>
      )}

      <Switch>
        {views.map(route => {
          return (
            <Route
              key={route.label}
              path={defaultPath + route.path + "/:subview?"}
            >
              {route.component && route.component()}
            </Route>
          );
        })}
      </Switch>
    </>
  );
}
