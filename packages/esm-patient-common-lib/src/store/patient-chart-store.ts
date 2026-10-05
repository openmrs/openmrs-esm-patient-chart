import { type Actions, createGlobalStore, useStoreWithActions, type Visit } from '@openmrs/esm-framework';
import { type PatientWorkspaceGroupProps } from '../workspaces';

export interface PatientChartStore {
  patientUuid: string;
  patient: fhir.Patient;
  activeVisit: Visit;
  /**
   * The uuid of the active visit the patient-chart workspace group was last launched with.
   * Note that when the active visit is changed, the workspaces group (with the stale active visit)
   * must close and reopen, and during that process its activeVisit might differ from
   * `store.activeVisit`
   */
  workspaceGroupVisitUuid?: string | null;
  /**
   * The group props the patient-chart workspace group was last launched with. The workspace system
   * only relaunches the group when the patient or visit uuid changes, so these objects can be older
   * than `patient` / `activeVisit` above. See `getPatientChartWindowProps`.
   */
  workspaceGroupProps?: PatientWorkspaceGroupProps | null;
}

const patientChartStoreName = 'patient-chart-global-store';

const patientChartStore = createGlobalStore<PatientChartStore>(patientChartStoreName, {
  patientUuid: null,
  patient: null,
  activeVisit: null,
  workspaceGroupVisitUuid: null,
  workspaceGroupProps: null,
});

const patientChartStoreActions = {
  setPatient(_, patient: fhir.Patient) {
    return { patient, patientUuid: patient?.id ?? null };
  },
  setActiveVisit(_, activeVisit: Visit) {
    return { activeVisit };
  },
} satisfies Actions<PatientChartStore>;

/**
 * Records the active visit the patient-chart workspace group was last launched with.
 * Only the patient chart should call this, after it launches its workspace group.
 */
export function setPatientChartWorkspaceGroupVisitUuid(
  workspaceGroupVisitUuid: string | null,
  workspaceGroupProps?: PatientWorkspaceGroupProps | null,
) {
  patientChartStore.setState(
    workspaceGroupProps === undefined ? { workspaceGroupVisitUuid } : { workspaceGroupVisitUuid, workspaceGroupProps },
  );
}

/**
 * Non-reactive read of the patient chart store, for use inside callbacks (e.g. at the moment a
 * workspace is launched). Like `usePatientChartStore`, it only returns the store values if
 * `patientUuid` matches the patient in the store; otherwise it returns null. If `patientUuid` is
 * omitted, it returns the store values of whichever patient the patient chart currently has open
 * (or null if it has none).
 */
export function getPatientChartStoreState(patientUuid?: string): PatientChartStore | null {
  const state = patientChartStore.getState();
  if (patientUuid === undefined) {
    return state.patientUuid ? state : null;
  }
  return state.patientUuid === patientUuid ? state : null;
}

/**
 * Hook to access the values and sets of the patient chart store.
 * Note: This hooks SHOULD only be used by components inside the patient chart app.
 *
 * Workspaces / extensions that can be mounted by other apps (ex: the start visit form in the queue's app,
 * the clinical forms workspace in the ward app)
 * should have the patient / visit explicitly passed in as props.
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
      setActiveVisit: () => {},
      patient: null,
      patientUuid: null,
      activeVisit: null,
      workspaceGroupVisitUuid: null,
      workspaceGroupProps: null,
    };
    return fakeStore;
  }
}
