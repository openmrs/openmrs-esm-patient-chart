import { createContext, useContext } from "react";

export interface ConditionsContextShape {
  patientUuid: string;
  patient: fhir.Patient;
}

export const ConditionsContext = createContext<ConditionsContextShape>({
  patientUuid: undefined,
  patient: undefined,
});

export function useConditionsContext() {
  return useContext(ConditionsContext);
}
