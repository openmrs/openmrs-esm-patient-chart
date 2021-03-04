import React from "react";
import styles from "./dashboard.css";
import Widget, { WidgetConfig } from "../widget/widget.component";
import { ExtensionSlot } from "@openmrs/esm-framework";
import { useUrlData } from "../../useUrlData";

function getColumnsLayoutStyle(props: DashboardProps) {
  const numberOfColumns = props.dashboardConfig?.layout?.columns ?? 2;
  return "1fr ".repeat(numberOfColumns).trimRight();
}

function sanitize(name: string) {
  return name.toLowerCase().replace(/\s/, "-");
}

export interface DashboardProps {
  dashboardConfig: DashboardConfig;
}

export interface DashboardConfig {
  name: string;
  title?: string;
  layout?: {
    columns: number;
  };
  widgets: Array<WidgetConfig>;
}

export default function Dashboard(props: DashboardProps) {
  const [widgets, setWidgets] = React.useState<Array<JSX.Element>>([]);
  const urlData = useUrlData();
  const dashboardName = sanitize(props.dashboardConfig.name);

  React.useEffect(() => {
    setWidgets(
      props.dashboardConfig.widgets.map(widgetConfig => (
        <Widget key={widgetConfig.name} widgetConfig={widgetConfig} />
      ))
    );
  }, [props.dashboardConfig]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.dashboard} style={{ gridTemplateColumns: 1 }}>
          <ExtensionSlot
            extensionSlotName={`patient-chart-${dashboardName}`}
            state={urlData}
          />
        </div>
      </div>
      <div className={styles.container}>
        <div
          className={styles.dashboard}
          style={{ gridTemplateColumns: getColumnsLayoutStyle(props) || 2 }}
        >
          {widgets.map((widget, index) => {
            const widgetConfig = props.dashboardConfig.widgets[index];
            let rows =
              (widgetConfig.layout && widgetConfig.layout.rowSpan) || 1;
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
    </>
  );
}
