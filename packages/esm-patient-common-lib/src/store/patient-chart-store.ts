import { type Actions, createGlobalStore, useStoreWithActions, type Visit } from '@openmrs/esm-framework';

export interface PatientChartStore {
  patientUuid: string;
  patient: fhir.Patient;
  visitContext: Visit;
  mutateVisitContext: () => void;
}

const patientChartStoreName = 'patient-chart-global-store';

const patientChartStore = createGlobalStore<PatientChartStore>(patientChartStoreName, {
  patientUuid: null,
  patient: null,
  visitContext: null,
  mutateVisitContext: null,
});

const patientCharStoreActions = {
  setPatient(_, patient: fhir.Patient) {
    return { patient, patientUuid: patient?.id ?? null, visitContext: null, mutateVisitContext: null };
  },
  setVisitContext(_, visitContext: Visit, mutateVisitContext: () => void) {
    return { visitContext, mutateVisitContext };
  },
} satisfies Actions<PatientChartStore>;

/**
 * Hook to access the values and sets of the patient chart store.
 * Note: This hooks MUST only be used by components inside the patient chart app.
 * Workspaces / extensions that can be mounted by other apps (ex: the start visit form in the queue's app,
 * the clinical forms workspace in the ward app), where the app display information of multiple patients,
 * should have the patient / visitContext explicitly passed in as props.
 * @returns
 */
export function usePatientChartStore() {
  return useStoreWithActions(patientChartStore, patientCharStoreActions);
}
