import { BehaviorSubject } from 'rxjs';

// This is a work around until attach function is re-worked to enable passing of props
export interface FormEntryProps {
  encounterUuid?: string;
  visitUuid?: string;
  formUuid: string;
  patient: fhir.Patient;
}

export const formEntrySub = new BehaviorSubject<FormEntryProps | null>(null);
