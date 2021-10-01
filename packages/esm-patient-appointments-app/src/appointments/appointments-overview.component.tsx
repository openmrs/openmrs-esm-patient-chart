import React from 'react';
import AppointmentsBase from './appointments-base.component';

interface AppointmentOverviewProps {
  basePath: string;
  patientUuid: string;
}

const AppointmentsOverview: React.FC<AppointmentOverviewProps> = ({ patientUuid }) => (
  <AppointmentsBase patientUuid={patientUuid} />
);

export default AppointmentsOverview;
