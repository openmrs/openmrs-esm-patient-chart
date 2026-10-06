import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { launchWorkspaceGroup2, showSnackbar, usePatient, useVisit } from '@openmrs/esm-framework';
import {
  type PatientWorkspaceGroupProps,
  setPatientChartWorkspaceGroupVisitUuid,
  usePatientChartStore,
} from '@openmrs/esm-patient-common-lib';

type WorkspaceGroupLaunchKey = {
  patientUuid: string | null;
  activeVisitUuid: string | null;
};

// The workspace group is current only when it was launched for this patient and visit context.
function getWorkspaceGroupLaunchKey(groupProps: PatientWorkspaceGroupProps | null): WorkspaceGroupLaunchKey {
  return {
    patientUuid: groupProps?.patientUuid ?? null,
    activeVisitUuid: groupProps?.activeVisit?.uuid ?? null,
  };
}

function workspaceGroupLaunchKeysEqual(a: WorkspaceGroupLaunchKey | null, b: WorkspaceGroupLaunchKey | null) {
  return a?.patientUuid === b?.patientUuid && a?.activeVisitUuid === b?.activeVisitUuid;
}

/**
 * This hook manages fetching of the patient and the patient's active visit
 * when entering the patient chart, and the associated updates to the patient chart store.
 *
 * The patient chart store sets the patient when we enter the patient chart
 * and unsets the patient when we leave. (This gives extensions and workspaces a way
 * to check whether they are rendered within the patient chart app.)
 *
 * The visit of the patient chart is always the patient's active visit, or null if there is none.
 * It is read from `useVisit` and mirrored into the store and the group props that the
 * patient-chart workspace group is launched with. The group is relaunched when the patient or the
 * active visit's uuid changes.
 * @param patientUuid
 * @returns
 */
export function usePatientChartPatientAndVisit(patientUuid: string) {
  const { t } = useTranslation();
  const { isLoading: isLoadingPatient, patient } = usePatient(patientUuid);
  const {
    patientUuid: storePatientUuid,
    setPatient,
    activeVisit: storedActiveVisit,
    setActiveVisit,
  } = usePatientChartStore(patientUuid);
  const { activeVisit, isValidating: isValidatingActiveVisit } = useVisit(patientUuid);

  const launchedWorkspaceGroupKey = useRef<WorkspaceGroupLaunchKey | null>(null);
  const launchedWorkspaceGroupProps = useRef<PatientWorkspaceGroupProps | null>(null);
  const latestWorkspaceGroupProps = useRef<PatientWorkspaceGroupProps | null>(null);
  const isWorkspaceGroupLaunchPending = useRef(false);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const launchLatestWorkspaceGroup = useCallback(async () => {
    if (isWorkspaceGroupLaunchPending.current) {
      return;
    }

    isWorkspaceGroupLaunchPending.current = true;

    try {
      let needsLaunch = true;
      while (needsLaunch) {
        const groupProps = latestWorkspaceGroupProps.current;
        const launchKey = getWorkspaceGroupLaunchKey(groupProps);

        if (workspaceGroupLaunchKeysEqual(launchKey, launchedWorkspaceGroupKey.current)) {
          needsLaunch = false;
          continue;
        }

        if (!isMounted.current) {
          return;
        }

        const launched = await launchWorkspaceGroup2('patient-chart', groupProps);

        if (!isMounted.current) {
          return;
        }

        // launchWorkspaceGroup2 returns false when the user keeps the current workspace group open.
        if (!launched) {
          needsLaunch = false;
          continue;
        }

        launchedWorkspaceGroupKey.current = launchKey;
        launchedWorkspaceGroupProps.current = groupProps;

        const latestLaunchKey = getWorkspaceGroupLaunchKey(latestWorkspaceGroupProps.current);
        if (workspaceGroupLaunchKeysEqual(latestLaunchKey, launchedWorkspaceGroupKey.current)) {
          needsLaunch = false;
        }
      }
    } finally {
      isWorkspaceGroupLaunchPending.current = false;
    }
  }, []);

  useEffect(() => {
    const initializeWorkspaceGroup = async () => {
      if (!isValidatingActiveVisit && patient) {
        const groupProps: PatientWorkspaceGroupProps = {
          patientUuid: patient.id,
          patient,
          activeVisit: activeVisit ?? null,
        };

        setActiveVisit(groupProps.activeVisit);

        latestWorkspaceGroupProps.current = groupProps;
        await launchLatestWorkspaceGroup();
        if (isMounted.current) {
          setPatientChartWorkspaceGroupVisitUuid(
            launchedWorkspaceGroupKey.current?.activeVisitUuid ?? null,
            launchedWorkspaceGroupProps.current,
          );
        }
      }
    };

    initializeWorkspaceGroup().catch((error) => {
      showSnackbar({
        title: t('errorLaunchingWorkspaceGroup', 'Error launching workspace group'),
        subtitle: error.message,
        kind: 'error',
        isLowContrast: false,
      });
    });

    return () => {};
  }, [setActiveVisit, activeVisit, isValidatingActiveVisit, storePatientUuid, patient, t, launchLatestWorkspaceGroup]);

  useEffect(() => {
    if (!isLoadingPatient) {
      setPatient(patient);
    }

    return () => {
      setPatient(null);
    };
  }, [patient, setPatient, isLoadingPatient]);

  const state = useMemo(
    () => ({
      patientUuid,
      patient: patient ?? {},
      visitContext: storedActiveVisit,
      isLoadingPatient,
      setPatient,
    }),
    [patient, patientUuid, storedActiveVisit, isLoadingPatient, setPatient],
  );

  return state;
}
