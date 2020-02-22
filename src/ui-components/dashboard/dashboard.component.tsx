import React, { FunctionComponent } from "react";
import styles from "./dashboard.css";
import { coreWidgets } from "../../widgets/core-widgets";

export default function Dashboard(props: DashboardProps) {
  const [dashboard, setDashboard] = React.useState();

  React.useEffect(() => {
    loadDashboardFromConfig(props.dashboardConfig);
  }, [props.dashboardConfig]);

  function getColumnsLayoutStyle(): string {
    const numberOfColumns =
      props.dashboardConfig.layout && props.dashboardConfig.layout.columns
        ? props.dashboardConfig.layout.columns
        : 2;

    return String("1fr ")
      .repeat(numberOfColumns)
      .trimRight();
  }

  const getWidgetSizeStyle = (rows, columns): GridSizeType => ({
    gridRow: `span ${rows}`,
    gridColumn: `span ${columns}`
  });

  function loadDashboardFromConfig(dashboardConfig: DashboardConfigType) {
    const promises = [];
    dashboardConfig.widgets.forEach(widget => {
      widget.esModule && promises.push(System.import(widget.esModule));
    });
    Promise.all(promises).then(modules => {
      dashboardConfig.widgets.forEach((widget, i) => {
        let Component: FunctionComponent;
        if (widget.esModule) {
          Component = modules[i].widgets[widget.name];
          widget.component = () => <Component />;
        } else {
          widget.component = coreWidgets[widget.name].component;
        }

        dashboardConfig.widgets[i] = widget;
      });
      setDashboard(<Dashboard dashboardConfig={dashboardConfig} />);
    });
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.dashboard}
        style={{ gridTemplateColumns: getColumnsLayoutStyle() }}
      >
        {props.dashboardConfig.widgets.map((widget, index) => {
          let Component = widget.component;
          let rows = widget.layout && (widget.layout.rowSpan || 1);
          let columns = widget.layout && (widget.layout.columnSpan || 1);
          return (
            <div
              key={index}
              className={styles.widgetContainer}
              style={{
                gridRow: `span ${rows}`,
                gridColumn: `span ${columns}`
              }}
            >
              <Component key={index} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type DashboardProps = {
  dashboardConfig: DashboardConfigType;
};

type GridSizeType = {
  gridRow: string;
  gridColumn: string;
};

export type DashboardConfigType = {
  name: string;
  title: string;
  layout: {
    columns: number;
  };
  widgets: WidgetConfigType[];
};

export type WidgetConfigType = {
  name: string;
  path?: string;
  esModule?: string;
  layout?: {
    rowSpan?: number;
    columnSpan?: number;
  };
  component?: Function;
};
