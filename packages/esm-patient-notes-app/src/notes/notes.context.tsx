import { createContext, useContext } from "react";

export interface NotesContextShape {
  patientUuid: string;
  patient: fhir.Patient;
}

export const NotesContext = createContext<NotesContextShape>({
  patientUuid: undefined,
  patient: undefined
});

export function useProgramsContext() {
  return useContext(NotesContext);
}
