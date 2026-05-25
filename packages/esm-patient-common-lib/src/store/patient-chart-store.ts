import { type Actions, createGlobalStore, useStoreWithActions, type Visit } from '@openmrs/esm-framework';

/**
 * Global store holding the currently active patient and visit context for the patient chart.
 *
 * Fields:
 * - `patientUuid` — UUID of the patient currently open in the chart
 * - `patient` — Full FHIR Patient resource (populated after the chart loads)
 * - `visitContext` — The active visit for this patient (null if no visit is active)
 * - `mutateVisitContext` — SWR mutate function to revalidate the visit context
 *
 * Design note: We use a single global store (not per-patient) because only one patient
 * chart is open at a time. The `usePatientChartStore` hook validates the `patientUuid`
 * to prevent stale reads when navigating between patients.
 */
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

const patientChartStoreActions = {
  setPatient(_, patient: fhir.Patient) {
    return { patient, patientUuid: patient?.id ?? null };
  },
  setVisitContext(_, visitContext: Visit, mutateVisitContext: () => void) {
    return { visitContext, mutateVisitContext };
  },
} satisfies Actions<PatientChartStore>;

/**
 * Hook to access the values and sets of the patient chart store.
 * Note: This hooks SHOULD only be used by components inside the patient chart app.
 *
 * Workspaces / extensions that can be mounted by other apps (ex: the start visit form in the queue's app,
 * the clinical forms workspace in the ward app)
 * should have the patient / visitContext explicitly passed in as props.
 *
 * As a safety feature, this hook requires the patientUuid as the input, and only
 * returns the actual store values if input patientUuid matches that in the store.
 */
export function usePatientChartStore(patientUuid: string) {
  const store = useStoreWithActions(patientChartStore, patientChartStoreActions);
  if (store.patientUuid === patientUuid) {
    return store;
  } else {
    const fakeStore: typeof store = {
      ...store,
      mutateVisitContext: null,
      setVisitContext: () => {},
      patient: null,
      patientUuid: null,
      visitContext: null,
    };
    return fakeStore;
  }
}
