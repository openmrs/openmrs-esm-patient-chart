import { createContext, useContext } from 'react';

export interface AppointmentsContextShape {
  patientUuid: string;
  patient: fhir.Patient;
}

export const AppointmentsContext = createContext<AppointmentsContextShape>({
  patientUuid: undefined,
  patient: undefined,
});

export function useAppointmentsContext() {
  return useContext(AppointmentsContext);
}
