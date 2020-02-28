import React from "react";
import {
  Route,
  Link,
  Redirect,
  useHistory,
  useParams,
  useLocation
} from "react-router-dom";

import styles from "./chart-widget.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ChartWidget(props: any) {
  let { patientUuid } = useParams();
  const history = useHistory();

  let queryParams = useQuery();

  function getInitialTab() {
    const tab = queryParams.get("tab");
    return tab == null
      ? props.widgetConfig.defaultTabIndex
      : props.widgetConfig.tabs.findIndex(element => element.name === tab);
  }

  const [selected, setSelected] = React.useState(getInitialTab());

  return (
    <>
      <nav className={styles.summariesnav} style={{ marginTop: "0" }}>
        <ul>
          {props.widgetConfig.tabs.map((item, index) => {
            return (
              <li key={index}>
                <div
                  className={`${
                    index === selected ? styles.selected : styles.unselected
                  }`}
                >
                  <Link to={`${props.widgetConfig.name}?tab=${item.name}`}>
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
      <div style={{ margin: "21px" }}>
        {props.widgetConfig.tabs[selected].component()}
      </div>
    </>
  );
}

type WidgetProps = {};
