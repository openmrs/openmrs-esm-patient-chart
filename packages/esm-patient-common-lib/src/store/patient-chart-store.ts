import { type Actions, createGlobalStore, useStoreWithActions, type Visit } from '@openmrs/esm-framework';

export interface PatientChartStore {
  patientUuid: string;
  patient: fhir.Patient;
  visitContext: Visit;
  mutateVisitContext: () => void;
  /**
   * The uuid of the visit context the patient-chart workspace group was last launched with.
   * Note that when the visit context is changed, the workspaces group (with stale visit context)
   * must close and reopen, and during that process its visitContext might differ from 
   * `store.visitContext`
   */
  workspaceGroupVisitUuid?: string | null;
}

const patientChartStoreName = 'patient-chart-global-store';

const patientChartStore = createGlobalStore<PatientChartStore>(patientChartStoreName, {
  patientUuid: null,
  patient: null,
  visitContext: null,
  mutateVisitContext: null,
  workspaceGroupVisitUuid: null,
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
 * Records the visit context the patient-chart workspace group was last launched with.
 * Only the patient chart should call this, after it launches its workspace group.
 */
export function setPatientChartWorkspaceGroupVisitUuid(workspaceGroupVisitUuid: string | null) {
  patientChartStore.setState({ workspaceGroupVisitUuid });
}

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
      workspaceGroupVisitUuid: null,
    };
    return fakeStore;
  }
}
