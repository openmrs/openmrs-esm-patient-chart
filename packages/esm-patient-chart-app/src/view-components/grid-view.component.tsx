import React from "react";
import styles from "./grid-view.css";
import { ExtensionSlot } from "@openmrs/esm-framework";
import { DashbardGridConfig } from "../config-schemas";
import { useUrlData } from "../useUrlData";

function getColumnsLayoutStyle(layout: DashbardGridConfig) {
  const numberOfColumns = layout?.columns ?? 2;
  return "1fr ".repeat(numberOfColumns).trimRight();
}

export interface GridViewProps {
  name: string;
  slot: string;
  patientUuid: string;
  layout: DashbardGridConfig;
}

export default function GridView({
  slot,
  layout,
  patientUuid,
}: GridViewProps) {
  const urlData = useUrlData();
  const state = {
    ...urlData,
    patientUuid,
  };

  return (
    <div
      className={styles.dashboard}
      style={{ gridTemplateColumns: getColumnsLayoutStyle(layout) || 2 }}
    >
      <ExtensionSlot extensionSlotName={slot} state={state} />
    </div>
  );
}
