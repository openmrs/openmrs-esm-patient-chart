import React, { useRef, useReducer } from "react";
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
import { VisitButton } from "@openmrs/esm-patient-chart-widgets";
import {
  ChartConfig,
  Navbar
} from "../config-schemas/openmrs-esm-patient-chart-schema";

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
  enum PagerVisibility {
    NONE,
    LEFT,
    RIGHT,
    BOTH
  }
  const initialHeaderPagerVisibility = {
    pagerVisibility: PagerVisibility.NONE
  };

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

  const headerPagerVisibilityReducer = (state, action) => {
    if (!navHeaderOverflowed) {
      return { pagerVisibility: PagerVisibility.NONE };
    }
    if (navRef.current.scrollLeft === 0) {
      return { pagerVisibility: PagerVisibility.RIGHT };
    }

    let scrolledToRightEnd =
      navRef.current.scrollLeft + navRef.current.clientWidth + 50 >=
      navRef.current.scrollWidth;

    if (scrolledToRightEnd) {
      return { pagerVisibility: PagerVisibility.LEFT };
    }
    return { pagerVisibility: PagerVisibility.BOTH };
  };

  const [headerPagerState, dispatch] = useReducer(
    headerPagerVisibilityReducer,
    initialHeaderPagerVisibility
  );

  const onNavHeaderScrolled = () => {
    dispatch("scrolled");
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
      if (!navHeaderOverflowed) {
        setNavHeaderOverflowed(true);
        dispatch("overflowed-changed");
      }
    } else {
      if (navHeaderOverflowed) {
        setNavHeaderOverflowed(false);
        dispatch("overflowed-changed");
      }
    }
  };
  checkForOverflow();
  return (
    <>
      <div className={styles.navContainer}>
        {(headerPagerState.pagerVisibility === PagerVisibility.LEFT ||
          headerPagerState.pagerVisibility === PagerVisibility.BOTH) && (
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
          <VisitButton />
        </nav>
        {(headerPagerState.pagerVisibility === PagerVisibility.RIGHT ||
          headerPagerState.pagerVisibility === PagerVisibility.BOTH) && (
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
      <div className={styles.chartSection}>
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
      </div>
    </>
  );
}
