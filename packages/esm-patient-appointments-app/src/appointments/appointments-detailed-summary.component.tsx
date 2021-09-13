import React from 'react';
import { useAppointmentsContext } from './appointments.context';
import AppointmentBase from './appointment-base.component';

interface AppointmentsDetailedSummaryProps {}

const AppointmentsDetailedSummary: React.FC<AppointmentsDetailedSummaryProps> = () => {
  const { patientUuid } = useAppointmentsContext();
  return <AppointmentBase patientUuid={patientUuid} />;
};

export default AppointmentsDetailedSummary;
