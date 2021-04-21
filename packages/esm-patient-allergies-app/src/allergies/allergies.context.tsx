import { createContext, useContext } from "react";

export interface AllergiesContextShape {
  patientUuid: string;
  patient: fhir.Patient;
}

export const AllergiesContext = createContext<AllergiesContextShape>({
  patientUuid: undefined,
  patient: undefined,
});

export function useAllergiesContext() {
  return useContext(AllergiesContext);
}
