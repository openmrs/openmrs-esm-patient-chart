import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useMatch } from 'react-router-dom';
import {
  Extension,
  ExtensionData,
  ExtensionSlot,
  getExtensionNameFromId,
  useExtensionSlotMeta,
} from '@openmrs/esm-framework';
import { dashboardPath } from '../../constants';
import styles from './dashboard-view.scss';

function getColumnsLayoutStyle(dashboard: DashboardConfig) {
  const numberOfColumns = dashboard.columns ?? 2;
  return '1fr '.repeat(numberOfColumns).trimEnd();
}

export interface DashboardConfig {
  slot: string;
  title: string | (() => string | Promise<string>);
  path: string;
  columns: number;
  hideDashboardTitle?: boolean;
}

interface DashboardViewProps {
  dashboard: DashboardConfig;
  patientUuid: string;
  patient: fhir.Patient;
}

export function DashboardView({ dashboard, patientUuid, patient }: DashboardViewProps) {
  const widgetMetas = useExtensionSlotMeta(dashboard.slot);
  const {
    params: { view },
  } = useMatch(dashboardPath);
  const gridTemplateColumns = getColumnsLayoutStyle(dashboard);

  const state = useMemo(
    () => ({
      basePath: view,
      patient,
      patientUuid,
    }),
    [patient, patientUuid, view],
  );

  const wrapItem = useCallback(
    (slot: ReactNode, extension: ExtensionData) => {
      const { columnSpan = 1 } = widgetMetas[getExtensionNameFromId(extension.extensionId)];
      return <div style={{ gridColumn: `span ${columnSpan}` }}>{slot}</div>;
    },
    [widgetMetas],
  );

  const [resolvedTitle, setResolvedTitle] = useState<string | undefined>();

  useEffect(() => {
    if (typeof dashboard?.title === 'function') {
      Promise.resolve(dashboard.title()).then(setResolvedTitle);
    } else if (typeof dashboard?.title === 'string') {
      setResolvedTitle(dashboard.title);
    }
  }, [dashboard]);

  return (
    <>
      <ExtensionSlot state={state} extensionSlotName="top-of-all-patient-dashboards-slot" />
      {!dashboard.hideDashboardTitle && resolvedTitle && <h1 className={styles.dashboardTitle}>{resolvedTitle}</h1>}
      <ExtensionSlot
        key={dashboard.slot}
        extensionSlotName={dashboard.slot}
        className={styles.dashboard}
        style={{ gridTemplateColumns }}
      >
        <Extension state={state}>{wrapItem}</Extension>
      </ExtensionSlot>
    </>
  );
}
