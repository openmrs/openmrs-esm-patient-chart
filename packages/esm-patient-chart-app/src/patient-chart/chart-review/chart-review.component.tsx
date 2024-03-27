import React, { useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { type ConfigObject, useExtensionStore } from '@openmrs/esm-framework';
import { useNavGroups } from '@openmrs/esm-patient-common-lib';
import { DashboardView, type DashboardConfig, type LayoutMode } from './dashboard-view.component';
import { basePath } from '../../constants';

function makePath(target: DashboardConfig, params: Record<string, string> = {}) {
  const parts = `${basePath}/${encodeURIComponent(target.path)}`.split('/');

  Object.keys(params).forEach((key) => {
    for (let i = 0; i < parts.length; i++) {
      if (parts[i][0] === ':' && parts[i].indexOf(key) === 1) {
        parts[i] = params[key];
      }
    }
  });

  return parts.join('/');
}

function getDashboardDefinition(meta: object, config: ConfigObject) {
  return { ...meta, ...config };
}

interface ChartReviewProps {
  patientUuid: string;
  patient: fhir.Patient;
  view: string;
  setDashboardLayoutMode?: (layoutMode: LayoutMode) => void;
}

const ChartReview: React.FC<ChartReviewProps> = ({ patientUuid, patient, view, setDashboardLayoutMode }) => {
  const extensionStore = useExtensionStore();
  const { navGroups } = useNavGroups();

  const ungroupedDashboards = useMemo(
    () =>
      extensionStore.slots['patient-chart-dashboard-slot']?.assignedExtensions?.map((e) =>
        getDashboardDefinition(e.meta, e.config),
      ) ?? [],
    [extensionStore.slots['patient-chart-dashboard-slot']],
  );

  const groupedDashboards = useMemo(
    () =>
      navGroups.flatMap(
        (slotName) =>
          extensionStore.slots[slotName]?.assignedExtensions?.map((e) => getDashboardDefinition(e.meta, e.config)) ??
          [],
      ),
    [extensionStore.slots, navGroups],
  );

  const dashboards = ungroupedDashboards.concat(groupedDashboards) as Array<DashboardConfig>;

  const defaultDashboard = useMemo(() => dashboards.find((dashboard) => dashboard.path), [dashboards]);

  const dashboard = useMemo(() => {
    return dashboards.find((dashboard) => dashboard.path === view);
  }, [dashboards, view]);

  useEffect(() => {
    const activeDashboard = dashboard ?? defaultDashboard;
    if (setDashboardLayoutMode) {
      setDashboardLayoutMode(activeDashboard?.layoutMode ?? 'contained');
    }
  }, [dashboard, defaultDashboard, setDashboardLayoutMode]);

  if (!extensionStore.slots['patient-chart-dashboard-slot'] || !defaultDashboard) {
    return null;
  }

  if (!dashboard) {
    return (
      <Navigate
        to={makePath(defaultDashboard, {
          patientUuid,
        })}
        replace
      />
    );
  } else {
    return <DashboardView dashboard={dashboard} patientUuid={patientUuid} patient={patient} />;
  }
};

export default ChartReview;
