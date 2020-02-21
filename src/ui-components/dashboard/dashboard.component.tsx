import React, { FunctionComponent } from "react";
import styles from "./dashboard.css";

export default function Dashboard(props: DashboardProps) {
  function getColumnsLayoutStyle(): string {
    const numberOfColumns =
      props.dashboardConfig.layout && props.dashboardConfig.layout.columns
        ? props.dashboardConfig.layout.columns
        : 2;

    return String("1fr ")
      .repeat(numberOfColumns)
      .trimRight();
  }

  const getWidgetSizeStyle = (rows, columns): GridSize => ({
    gridRow: `span ${rows}`,
    gridColumn: `span ${columns}`
  });

  return (
    <div className={styles.container}>
      <div
        className={styles.dashboard}
        style={{ gridTemplateColumns: getColumnsLayoutStyle() }}
      >
        {props.dashboardConfig.widgets.map((widget, index) => {
          let Component = widget.component;
          let rows = widget.rows || 1;
          let columns = widget.columns || 1;
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
  dashboardConfig: DashboardConfig;
};

type GridSize = {
  gridRow: string;
  gridColumn: string;
};

export type DashboardConfig = {
  layout: {
    columns: number;
  };
  widgets: WidgetConfig[];
};

export type WidgetConfig = {
  name: string;
  rows?: number;
  columns?: number;
  component: FunctionComponent;
};
