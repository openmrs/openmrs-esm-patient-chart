import React from 'react';
import styles from './grid-view.css';
import { useRouteMatch } from 'react-router-dom';
import { Extension, ExtensionData, ExtensionSlot, useExtensionSlotMeta } from '@openmrs/esm-framework';
import { DashbardGridConfig } from '../config-schemas';
import { basePath } from '../constants';

function getColumnsLayoutStyle(layout: DashbardGridConfig) {
  const numberOfColumns = layout?.columns ?? 2;
  return '1fr '.repeat(numberOfColumns).trimRight();
}

export interface GridViewProps {
  name: string;
  slot: string;
  patient: fhir.Patient;
  patientUuid: string;
  layout: DashbardGridConfig;
}

export default function GridView({ slot, layout, patient, patientUuid }: GridViewProps) {
  const slotMeta = useExtensionSlotMeta(slot);
  const { url } = useRouteMatch(basePath);

  const state = React.useMemo(
    () => ({
      basePath: url,
      patient,
      patientUuid,
    }),
    [url, patientUuid, patient],
  );

  const wrapItem = React.useCallback(
    (slot: React.ReactNode, extension: ExtensionData) => {
      const { columnSpan = 1 } = slotMeta[extension.extensionId];
      return <div style={{ gridColumn: `span ${columnSpan}` }}>{slot}</div>;
    },
    [slotMeta],
  );

  const gridTemplateColumns = getColumnsLayoutStyle(layout);

  return (
    <ExtensionSlot key={slot} extensionSlotName={slot} className={styles.dashboard} style={{ gridTemplateColumns }}>
      <Extension state={state} wrap={wrapItem} />
    </ExtensionSlot>
  );
}
