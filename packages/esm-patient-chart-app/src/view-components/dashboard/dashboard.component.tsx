import React from "react";
import styles from "./dashboard.css";
import { ExtensionSlot } from "@openmrs/esm-framework";
import { DashboardConfig } from "../core-views";
import { useUrlData } from "../../useUrlData";

function getColumnsLayoutStyle(props: DashboardProps) {
  const numberOfColumns = props.dashboardConfig.layout?.columns ?? 2;
  return "1fr ".repeat(numberOfColumns).trimRight();
}

export interface DashboardProps {
  dashboardConfig: DashboardConfig;
}

export default function Dashboard(props: DashboardProps) {
  const { name } = props.dashboardConfig;
  const urlData = useUrlData();

  return (
    <>
      <div className={styles.container}>
        <div
          className={styles.dashboard}
          style={{ gridTemplateColumns: getColumnsLayoutStyle(props) || 2 }}
        >
          <ExtensionSlot
            extensionSlotName={props.dashboardConfig.extensionSlotName}
            state={urlData}
          />
        </div>
      </div>
    </>
  );
}
