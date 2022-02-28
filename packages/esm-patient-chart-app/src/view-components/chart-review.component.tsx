import React from 'react';
import { Redirect, useRouteMatch } from 'react-router-dom';
import { Extension, ExtensionData, ExtensionSlot, useExtensionSlotMeta } from '@openmrs/esm-framework';
import { DashbardLayoutConfig, DashboardConfig } from '../config-schemas';
import { basePath } from '../constants';
import styles from './chart-review.scss';

function makePath(target: DashboardConfig, params: Record<string, string> = {}) {
  const parts = `${basePath}/${target.name}/:subview?`.split('/');

  Object.keys(params).forEach((key) => {
    for (let i = 0; i < parts.length; i++) {
      if (parts[i][0] === ':' && parts[i].indexOf(key) === 1) {
        parts[i] = params[key];
      }
    }
  });

  return parts.join('/');
}

function getColumnsLayoutStyle(layout: DashbardLayoutConfig) {
  const numberOfColumns = layout?.columns ?? 2;
  return '1fr '.repeat(numberOfColumns).trimEnd();
}

interface ChartReviewProps {
  patientUuid: string;
  patient: fhir.Patient;
  view: string;
  subview: string;
}

const ChartReview: React.FC<ChartReviewProps> = ({ patientUuid, patient, view, subview }) => {
  const meta = useExtensionSlotMeta('patient-chart-dashboard-slot');
  const dashboards = Object.values(meta) as Array<DashboardConfig>;
  const defaultDashboard = dashboards[0];
  const dashboard = dashboards.find((dashboard) => dashboard.name === view);
  const dashboardMeta = useExtensionSlotMeta(dashboard?.slot);
  const { url } = useRouteMatch(basePath);
  const gridTemplateColumns = getColumnsLayoutStyle(dashboard?.config);

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
      const { columnSpan = 1 } = dashboardMeta[extension.extensionId];
      return <div style={{ gridColumn: `span ${columnSpan}` }}>{slot}</div>;
    },
    [dashboardMeta],
  );

  if (!defaultDashboard) {
    return null;
  } else if (!dashboard) {
    return (
      <Redirect
        to={makePath(defaultDashboard, {
          patientUuid,
          subview: '',
        })}
      />
    );
  } else {
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
};

export default ChartReview;
