import React from "react";
import styles from "./dashboard.css";
import Widget, { WidgetConfig } from "../widget/widget.component";

export default function Dashboard(props: DashboardProps) {
  const [widgets, setWidgets] = React.useState<JSX.Element[]>([]);

  React.useEffect(() => {
    setWidgets(
      props.dashboardConfig.widgets.map(widgetConfig => (
        <Widget key={widgetConfig.name} widgetConfig={widgetConfig} />
      ))
    );
  }, [props.dashboardConfig]);

  function getColumnsLayoutStyle(): string {
    const numberOfColumns =
      props.dashboardConfig &&
      props.dashboardConfig.layout &&
      props.dashboardConfig.layout.columns
        ? props.dashboardConfig.layout.columns
        : 2;

    return String("1fr ")
      .repeat(numberOfColumns)
      .trimRight();
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.dashboard}
        style={{ gridTemplateColumns: getColumnsLayoutStyle() || 2 }}
      >
        {widgets.map((widget, index) => {
          const widgetConfig = props.dashboardConfig.widgets[index];
          let rows = (widgetConfig.layout && widgetConfig.layout.rowSpan) || 1;
          let columns =
            widgetConfig.layout && (widgetConfig.layout.columnSpan || 1);
          return (
            <div
              key={widgetConfig.name}
              className={styles.widgetContainer}
              style={{
                gridRow: `span ${rows}`,
                gridColumn: `span ${columns}`
              }}
            >
              {widget}
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

export type DashboardConfig = {
  name: string;
  title?: string;
  layout?: {
    columns: number;
  };
  widgets: WidgetConfig[];
};
