import React from 'react';
import AppointmentBase from './appointment-base.component';

interface AppointmentOverviewProps {
  basePath: string;
  patientUuid: string;
}

const AppointmentsOverview: React.FC<AppointmentOverviewProps> = ({ patientUuid }) => (
  <AppointmentBase patientUuid={patientUuid} />
);
export default AppointmentsOverview;
