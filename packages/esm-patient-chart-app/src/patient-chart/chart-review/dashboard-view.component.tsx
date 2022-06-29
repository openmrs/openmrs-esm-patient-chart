import React from 'react';
import {
  Extension,
  ExtensionData,
  ExtensionSlot,
  getExtensionNameFromId,
  useExtensionSlotMeta,
} from '@openmrs/esm-framework';
import { useRouteMatch } from 'react-router-dom';
import { basePath } from '../../constants';
import styles from './dashboard-view.scss';

function getColumnsLayoutStyle(layout: DashbardLayoutConfig) {
  const numberOfColumns = layout?.columns ?? 2;
  return '1fr '.repeat(numberOfColumns).trimEnd();
}

export interface DashbardLayoutConfig {
  columns: number;
}

export interface DashboardConfig {
  slot: string;
  title: string;
  config: DashbardLayoutConfig;
}

interface DashboardViewProps {
  dashboard: DashboardConfig;
  patientUuid: string;
  patient: fhir.Patient;
}

export function DashboardView({ dashboard, patientUuid, patient }: DashboardViewProps) {
  const dashboardMeta = useExtensionSlotMeta(dashboard.slot);
  const { url } = useRouteMatch(basePath);
  const gridTemplateColumns = getColumnsLayoutStyle(dashboard.config);

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
      const { columnSpan = 1 } = dashboardMeta[getExtensionNameFromId(extension.extensionId)];
      return <div style={{ gridColumn: `span ${columnSpan}` }}>{slot}</div>;
    },
    [dashboardMeta],
  );

  return (
    <>
      {dashboard.title && <h1 className={styles.dashboardTitle}>{dashboard.title}</h1>}
      <ExtensionSlot
        key={dashboard.slot}
        extensionSlotName={dashboard.slot}
        className={styles.dashboard}
        style={{ gridTemplateColumns }}
      >
        <Extension state={state} wrap={wrapItem} />
      </ExtensionSlot>
    </>
  );
}
