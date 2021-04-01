import { createContext, useContext } from "react";

export interface ProgramsContextShape {
  patientUuid: string;
  patient: fhir.Patient;
}

export const ProgramsContext = createContext<ProgramsContextShape>({
  patientUuid: undefined,
  patient: undefined,
});

export function useProgramsContext() {
  return useContext(ProgramsContext);
}
