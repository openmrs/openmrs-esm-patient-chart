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

  const getWidgetSizeStyle = (rows, columns): GridSizeType => ({
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
          let rows = widget.layout && (widget.layout.rows || 1);
          let columns = widget.layout && (widget.layout.columns || 1);
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
  layout: {
    columns: number;
  };
  widgets: WidgetConfigType[];
};

export type WidgetConfigType = {
  name: string;
  layout?: {
    rows?: number;
    columns?: number;
  };
  component: FunctionComponent;
};
