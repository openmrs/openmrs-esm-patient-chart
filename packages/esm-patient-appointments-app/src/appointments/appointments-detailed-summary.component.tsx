import React from 'react';
import AppointmentBase from './appointments-base.component';

interface AppointmentsDetailedSummaryProps {
  patientUuid: string;
}

const AppointmentsDetailedSummary: React.FC<AppointmentsDetailedSummaryProps> = ({ patientUuid }) => {
  return <AppointmentBase patientUuid={patientUuid} />;
};

export default AppointmentsDetailedSummary;
