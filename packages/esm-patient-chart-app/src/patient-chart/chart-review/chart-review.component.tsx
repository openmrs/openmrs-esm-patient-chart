import React, { useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { type ConfigObject, useExtensionStore, registerExtensionSlot } from '@openmrs/esm-framework';
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

function isDashboardConfig(obj: unknown): obj is DashboardConfig {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'path' in obj &&
    typeof obj.path === 'string' &&
    'slot' in obj &&
    typeof obj.slot === 'string'
  );
}

const seenMessages = new Set<string>();

function getDashboardDefinition(meta: object, config: ConfigObject, moduleName: string, name: string) {
  const mergedDefinition = { ...meta, ...config, moduleName };
  if (isDashboardConfig(mergedDefinition)) {
    return mergedDefinition;
  } else {
    const msg = `Could not find a valid dashboard definition for the dashboard ${name} located in ${moduleName}`;
    if (!seenMessages.has(msg)) {
      console.error(msg);
      seenMessages.add(msg);
    }
    return null;
  }
}

interface ChartReviewProps {
  patientUuid: string;
  patient: fhir.Patient;
  view: string;
  setDashboardLayoutMode?: (layoutMode: LayoutMode) => void;
}

const ChartReview: React.FC<ChartReviewProps> = ({ patientUuid, patient, view, setDashboardLayoutMode }) => {
  const extensionStore = useExtensionStore();

  const dashboards = extensionStore.slots['patient-chart-dashboard-slot'].assignedExtensions
    .flatMap((e) => {
      if (e.config?.slotName) {
        if (e.config.slotName in extensionStore.slots) {
          return extensionStore.slots[e.config.slotName].assignedExtensions.map((e) =>
            getDashboardDefinition(e.meta, e.config, e.moduleName, e.name),
          );
        } else {
          registerExtensionSlot('@openmrs/esm-patient-chart-app', e.config.slotName);
          // Since we register the new extension slot, we need to force a re-render with the
          // update extensionStore. Throwing the promise will trigger suspense and since the
          // promise immediately resolves, it should re-render on the next tic.
          throw Promise.resolve();
        }
      }

      return getDashboardDefinition(e.meta, e.config, e.moduleName, e.name);
    })
    .filter(Boolean);

  const defaultDashboard = dashboards.filter((dashboard) => Boolean(dashboard.path))?.[0];
  const dashboard = useMemo(() => {
    return dashboards.find((dashboard) => dashboard.path === view);
  }, [dashboards, view]);

  useEffect(() => {
    const activeDashboard = dashboard ?? defaultDashboard;
    if (setDashboardLayoutMode) {
      setDashboardLayoutMode(activeDashboard.layoutMode ?? 'contained');
    }
  }, [dashboard, defaultDashboard, setDashboardLayoutMode]);

  if (!('patient-chart-dashboard-slot' in extensionStore.slots)) {
    return null;
  }

  if (!defaultDashboard) {
    return null;
  } else if (!dashboard) {
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
