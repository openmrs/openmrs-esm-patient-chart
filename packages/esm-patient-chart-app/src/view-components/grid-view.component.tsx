import React from "react";
import styles from "./grid-view.css";
import {
  Extension,
  ExtensionData,
  ExtensionSlot,
  useExtensionStore
} from "@openmrs/esm-framework";
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

export default function GridView({ slot, layout, patientUuid }: GridViewProps) {
  const store = useExtensionStore();
  const { basePath } = useUrlData();

  const state = React.useMemo(
    () => ({
      basePath,
      patientUuid
    }),
    [basePath, patientUuid]
  );

  const wrapItem = React.useCallback(
    (slot: React.ReactNode, extension: ExtensionData) => {
      const { columnSpan = 4 } = store.extensions[extension.extensionId].meta;
      return <div style={{ columnSpan }}>{slot}</div>;
    },
    [store.extensions]
  );

  const gridTemplateColumns = getColumnsLayoutStyle(layout);

  return (
    <div className={styles.dashboard} style={{ gridTemplateColumns }}>
      <ExtensionSlot extensionSlotName={slot}>
        <Extension state={state} wrap={wrapItem} />
      </ExtensionSlot>
    </div>
  );
}
