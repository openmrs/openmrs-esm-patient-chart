import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Extension,
  ExtensionData,
  ExtensionSlot,
  getExtensionNameFromId,
  useExtensionSlotMeta,
} from '@openmrs/esm-framework';
import { basePath, spaRoot } from '../../constants';
import styles from './dashboard-view.scss';

function getColumnsLayoutStyle(dashboard: DashboardConfig) {
  const numberOfColumns = dashboard.columns ?? 2;
  return '1fr '.repeat(numberOfColumns).trimEnd();
}

export interface DashboardConfig {
  slot: string;
  title: string;
  columns: number;
}

interface DashboardViewProps {
  dashboard: DashboardConfig;
  patientUuid: string;
  patient: fhir.Patient;
}

export function DashboardView({ dashboard, patientUuid, patient }: DashboardViewProps) {
  const widgetMetas = useExtensionSlotMeta(dashboard.slot);
  const dashboardMeta = useExtensionSlotMeta(dashboard.slot);
  const { view } = useParams();
  const gridTemplateColumns = getColumnsLayoutStyle(dashboard);

  const state = React.useMemo(
    () => ({
      basePath: `/openmrs/spa${basePath}/${view}`,
      patient,
      patientUuid,
    }),
    [view, patientUuid, patient],
  );

  const wrapItem = React.useCallback(
    (slot: React.ReactNode, extension: ExtensionData) => {
      const { columnSpan = 1 } = widgetMetas[getExtensionNameFromId(extension.extensionId)];
      return <div style={{ gridColumn: `span ${columnSpan}` }}>{slot}</div>;
    },
    [widgetMetas],
  );

  return (
    <>
      {dashboard.title && <h1 className={styles.dashboardTitle}>{dashboard.title}</h1>}
      <ExtensionSlot state={state} extensionSlotName="top-of-all-patient-dashboards-slot" />
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
