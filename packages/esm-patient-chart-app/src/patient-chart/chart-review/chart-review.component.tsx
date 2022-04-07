import React from 'react';
import { Redirect } from 'react-router-dom';
import { useExtensionStore } from '@openmrs/esm-framework';
import { useNavGroups } from '@openmrs/esm-patient-common-lib';
import { basePath } from '../../constants';
import { DashboardView, DashboardConfig } from './dashboard-view.component';

function makePath(target: DashboardConfig, params: Record<string, string> = {}) {
  const parts = `${basePath}/${target.name}`.split('/');

  Object.keys(params).forEach((key) => {
    for (let i = 0; i < parts.length; i++) {
      if (parts[i][0] === ':' && parts[i].indexOf(key) === 1) {
        parts[i] = params[key];
      }
    }
  });

  return parts.join('/');
}

interface ChartReviewProps {
  patientUuid: string;
  patient: fhir.Patient;
  view: string;
}

const ChartReview: React.FC<ChartReviewProps> = ({ patientUuid, patient, view }) => {
  const extensionStore = useExtensionStore();
  const { navGroups } = useNavGroups();

  if (!('patient-chart-dashboard-slot' in extensionStore.slots)) {
    return null;
  }

  const ungroupedDashboards = extensionStore.slots['patient-chart-dashboard-slot'].assignedExtensions.map(
    (e) => e.meta,
  );
  const groupedDashboards = navGroups
    .map((slotName) => extensionStore.slots[slotName].assignedExtensions.map((e) => e.meta))
    .flat();
  const dashboards = ungroupedDashboards.concat(groupedDashboards) as Array<DashboardConfig>;

  const defaultDashboard = dashboards[0];
  const dashboard = dashboards.find((dashboard) => dashboard.name === view);

  if (!defaultDashboard) {
    return null;
  } else if (!dashboard) {
    return (
      <Redirect
        to={makePath(defaultDashboard, {
          patientUuid,
        })}
      />
    );
  } else {
    return <DashboardView dashboard={dashboard} patientUuid={patientUuid} patient={patient} />;
  }
};

export default ChartReview;
