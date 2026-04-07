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
