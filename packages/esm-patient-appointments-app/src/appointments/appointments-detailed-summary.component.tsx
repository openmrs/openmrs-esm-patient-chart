import React from 'react';
import { useAppointmentsContext } from './appointments.context';
import AppointmentBase from './appointments-base.component';

interface AppointmentsDetailedSummaryProps {}

const AppointmentsDetailedSummary: React.FC<AppointmentsDetailedSummaryProps> = () => {
  const { patientUuid } = useAppointmentsContext();
  return <AppointmentBase patientUuid={patientUuid} />;
};

export default AppointmentsDetailedSummary;
