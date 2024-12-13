import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Extension, ExtensionSlot, useExtensionSlotMeta } from '@openmrs/esm-framework';
import { launchPatientWorkspace, launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';
import { dashboardPath } from '../../constants';
import styles from './dashboard-view.scss';

/**
 * The layout mode dictates the width occuppied by the chart dashboard widgets.
 * - In 'contained' mode, the dashboard widgets are displayed in a centered
 * container with a fixed width (max-width: 60rem).
 * - In 'anchored' mode, the dashboard widgets expand to occupy the entire width
 * of the chart dashboard
 */
export type LayoutMode = 'contained' | 'anchored';

export interface DashboardConfig {
  slot: string;
  title: string | (() => string | Promise<string>);
  path: string;
  hideDashboardTitle?: boolean;
  layoutMode?: LayoutMode;
  moduleName: string;
}

interface DashboardViewProps {
  dashboard: DashboardConfig;
  patientUuid: string;
  patient: fhir.Patient;
}

export function DashboardView({ dashboard, patientUuid, patient }: DashboardViewProps) {
  const widgetMetas = useExtensionSlotMeta(dashboard.slot);
  const { t } = useTranslation(dashboard.moduleName);
  const {
    params: { view },
  } = useMatch(dashboardPath);

  const state = useMemo(
    () => ({
      basePath: view,
      patient,
      patientUuid,
      launchPatientWorkspace,
      launchStartVisitPrompt,
    }),
    [patient, patientUuid, view],
  );

  const [resolvedTitle, setResolvedTitle] = useState<string | undefined>();

  useEffect(() => {
    if (typeof dashboard?.title === 'function') {
      Promise.resolve(dashboard.title()).then(setResolvedTitle);
    } else if (typeof dashboard?.title === 'string') {
      setResolvedTitle(dashboard.title);
    } else {
      setResolvedTitle(undefined);
    }
  }, [dashboard]);

  return (
    <>
      <ExtensionSlot state={state} name="top-of-all-patient-dashboards-slot" />
      {!dashboard.hideDashboardTitle && resolvedTitle && <h1 className={styles.dashboardTitle}>{t(resolvedTitle)}</h1>}
      <div className={styles.dashboardContainer}>
        <ExtensionSlot key={dashboard.slot} name={dashboard.slot} className={styles.dashboard}>
          {(extension) => {
            const { fullWidth = false } = widgetMetas[extension.id] || {};
            return (
              <div className={classNames(styles.extension, fullWidth && styles.fullWidth)}>
                <Extension state={state} className={styles.extensionWrapper} />
              </div>
            );
          }}
        </ExtensionSlot>
      </div>
    </>
  );
}
