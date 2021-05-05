import React from 'react';
import CustomView from './custom-view.component';
import GridView from './grid-view.component';
import TabbedView from './tabbed-view.component';
import { Redirect } from 'react-router-dom';
import { useExtensionSlotMeta } from '@openmrs/esm-framework';
import { DashboardConfig } from '../config-schemas';
import { basePath } from '../constants';

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
  } else if (dashboard.config.type === 'grid') {
    return (
      <GridView
        slot={dashboard.slot}
        layout={dashboard.config}
        name={dashboard.name}
        patient={patient}
        patientUuid={patientUuid}
      />
    );
  } else if (dashboard.config.type === 'tabs') {
    return (
      <TabbedView
        slot={dashboard.slot}
        layout={dashboard.config}
        name={dashboard.name}
        patientUuid={patientUuid}
        patient={patient}
        tab={subview}
      />
    );
  } else {
    return <CustomView slot={dashboard.slot} name={dashboard.name} patientUuid={patientUuid} patient={patient} />;
  }
};

export default ChartReview;
