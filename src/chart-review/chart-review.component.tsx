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
  const [overflowed, setOverflowed] = React.useState(false);
  const [leftPagerVisible, setLeftPagerVisible] = React.useState(false);
  const [rightPagerVisible, setRightPagerVisible] = React.useState(true);
  const [tabHistory, setTabHistory] = React.useState({});

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

  const listenScrollEvent = () => {
    //console.log("Scroll event detected!");
    if (navRef.current.scrollLeft === 0) {
      setLeftPagerVisible(false);
    } else {
      setLeftPagerVisible(true);
    }
    if (
      navRef.current.scrollLeft + navRef.current.clientWidth >=
      navRef.current.scrollWidth
    ) {
      setRightPagerVisible(false);
    } else {
      setRightPagerVisible(true);
    }
  };
  const navRef = useRef(null);
  const refs = navbarItems.reduce((acc, value) => {
    acc[navbarItems.indexOf(value)] = React.createRef();
    return acc;
  }, {});
  const scrollToItem = id => {
    if (refs[id]) {
      refs[id].current.scrollIntoView({
        behavior: "smooth",
        block: "end"
      });
    }
  };
  React.useEffect(() => {
    scrollToItem(selected);
  }, [selected]);

  if (
    navRef &&
    navRef.current &&
    navRef.current.scrollWidth - navRef.current.clientWidth > 0
  ) {
    // console.log('Overflow detected', navRef.current.scrollWidth, navRef.current.clientWidth, event);
    // console.log('NAV',navRef)
    if (!overflowed) setOverflowed(true);
  } else {
    if (overflowed) setOverflowed(false);
  }
  const nextPage = () => {
    // window.scrollBy(0,navRef.current.scrollWidth/navRef.current.clientWidth);
    // console.log(
    //   "Overflow detected",
    //   navRef.current.scrollWidth,
    //   navRef.current.clientWidth,
    //   navRef.current.scrollLeft
    // );
    navRef.current.scrollLeft =
      navRef.current.scrollLeft + navRef.current.clientWidth;
  };

  const previousPage = () => {
    // console.log(
    //   "Overflow detected",
    //   navRef.current.scrollWidth,
    //   navRef.current.clientWidth,
    //   navRef.current.scrollLeft
    // );
    const before = navRef.current.scrollLeft;
    navRef.current.scrollLeft =
      navRef.current.scrollLeft - navRef.current.clientWidth;
  };

  return (
    <>
      {overflowed && leftPagerVisible && (
        <button onClick={previousPage}>{"<"}</button>
      )}
      <nav
        onScroll={listenScrollEvent}
        ref={navRef}
        className={styles.topnav}
        style={{
          marginTop: "0",
          //border: "1px solid red",
          overflowX: "scroll",
          scrollbarWidth: "none" // Firefox
          // '&::-webkit-scrollbar': {
          //   display: 'none', // Safari + Chrome
          // }
        }}
      >
        <ul
          style={
            {
              //border: "1px solid blue",
            }
          }
        >
          {navbarItems &&
            navbarItems.map((item, index) => {
              return (
                <li key={index} ref={refs[index]}>
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
      {overflowed && rightPagerVisible && (
        <button onClick={nextPage}>{">"}</button>
      )}
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
