import React from "react";
import styles from "./dashboard.css";
import { ExtensionSlot } from "@openmrs/esm-framework";
import { DashboardConfig, DashbardLayoutConfig } from "../config-schemas";
import { useUrlData } from "../useUrlData";

function getColumnsLayoutStyle(layout: DashbardLayoutConfig) {
  const numberOfColumns = layout?.columns ?? 2;
  return "1fr ".repeat(numberOfColumns).trimRight();
}

export interface DashboardProps extends DashboardConfig {}

export default function Dashboard({ slot, layout }: DashboardProps) {
  const urlData = useUrlData();

  return (
    <div className={styles.container}>
      <div
        className={styles.dashboard}
        style={{ gridTemplateColumns: getColumnsLayoutStyle(layout) || 2 }}
      >
        <ExtensionSlot extensionSlotName={slot} state={urlData} />
      </div>
    </div>
  );
}
