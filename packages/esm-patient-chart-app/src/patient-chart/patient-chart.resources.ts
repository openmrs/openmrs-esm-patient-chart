import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import {
  launchWorkspaceGroup2,
  openmrsFetch,
  restBaseUrl,
  showSnackbar,
  usePatient,
  useVisit,
  type Visit,
} from '@openmrs/esm-framework';
import { type PatientWorkspaceGroupProps, usePatientChartStore } from '@openmrs/esm-patient-common-lib';

const defaultVisitCustomRepresentation =
  'custom:(uuid,display,voided,indication,startDatetime,stopDatetime,' +
  'encounters:(uuid,display,encounterDatetime,' +
  'form:(uuid,name),location:ref,' +
  'encounterType:ref,' +
  'encounterProviders:(uuid,display,' +
  'provider:(uuid,display))),' +
  'patient:(uuid,display),' +
  'visitType:(uuid,name,display),' +
  'attributes:(uuid,display,attributeType:(name,datatypeClassname,uuid),value),' +
  'location:(uuid,name,display))';

export function useVisitByUuid(visitUuid: string | null, representation: string = defaultVisitCustomRepresentation) {
  const url = `${restBaseUrl}/visit/${visitUuid}?v=${representation}`;
  const { data, ...rest } = useSWR<{ data: Visit }>(visitUuid ? url : null, openmrsFetch);
  return { visit: data?.data, ...rest };
}

/**
 * This hook manages fetching of the patient and the visitContext
 * when entering the patient chart, and the associated updated to patient chart store.
 *
 * The patient chart store sets the patient when we enter the patient chart
 * and unsets the patient when we leave. (This gives extensions and workspaces a way
 * to check whether they are rendered within the patient chart app.)
 * Note: We do not unset visitContext when leaving the chart, so it persists across
 * in‑app navigation. On a full page reload, visitContext is rehydrated by refetching
 * (via useVisit/useVisitByUuId) rather than restored from storage.
 * When we enter the chart, we want to update the visit context as follows:
 * does the the stored visitContext exist and belong to the patient?
 * 1. If so, the visitContext should be valid but possibly stale; fetch the visit again
 *    and update the context
 * 2. If not, fetch the active visit of the patient, If it exists, set it as the
 *    visitContext; otherwise, clear it.
 * @param patientUuid
 * @returns
 */
export function usePatientChartPatientAndVisit(patientUuid: string) {
  const { t } = useTranslation();
  const { isLoading: isLoadingPatient, patient } = usePatient(patientUuid);
  const {
    patientUuid: storePatientUuid,
    setPatient,
    visitContext,
    mutateVisitContext,
    setVisitContext,
  } = usePatientChartStore(patientUuid);

  const isVisitContextValid = visitContext?.patient.uuid === patientUuid;
  const {
    visit: newVisitContext,
    mutate: newMutateVisitContext,
    isValidating: isValidatingVisitContext,
  } = useVisitByUuid(isVisitContextValid ? visitContext.uuid : null);
  const {
    activeVisit,
    isValidating: isValidatingActiveVisit,
    mutate: mutateActiveVisit,
  } = useVisit(isVisitContextValid ? null : patientUuid);

  // undefined = not yet launched; null = launched with no active visit
  const launchedVisitContextUuid = useRef<string | null | undefined>(undefined);
  const latestWorkspaceGroupProps = useRef<PatientWorkspaceGroupProps>(null);
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
        const visitContextUuid = groupProps?.visitContext?.uuid ?? null;

        if (visitContextUuid === launchedVisitContextUuid.current) {
          needsLaunch = false;
          continue;
        }

        const launched = await launchWorkspaceGroup2('patient-chart', groupProps);

        if (!isMounted.current) {
          return;
        }

        if (!launched) {
          needsLaunch = false;
          continue;
        }

        launchedVisitContextUuid.current = visitContextUuid;

        const latestVisitContextUuid = latestWorkspaceGroupProps.current?.visitContext?.uuid ?? null;
        if (latestVisitContextUuid === launchedVisitContextUuid.current) {
          needsLaunch = false;
        }
      }
    } finally {
      isWorkspaceGroupLaunchPending.current = false;
    }
  }, []);

  useEffect(() => {
    const initializeWorkspaceGroup = async () => {
      if (!isValidatingVisitContext && !isValidatingActiveVisit && patient) {
        let groupProps: PatientWorkspaceGroupProps = null;
        if (activeVisit) {
          groupProps = {
            patientUuid: patient.id,
            patient,
            visitContext: activeVisit,
            mutateVisitContext: mutateActiveVisit,
          };
        } else if (newVisitContext) {
          groupProps = {
            patientUuid: patient.id,
            patient,
            visitContext: newVisitContext,
            mutateVisitContext: newMutateVisitContext,
          };
        } else {
          groupProps = {
            patientUuid: patient.id,
            patient,
            visitContext: null,
            mutateVisitContext: null,
          };
        }

        setVisitContext(groupProps.visitContext, groupProps.mutateVisitContext);

        latestWorkspaceGroupProps.current = groupProps;
        await launchLatestWorkspaceGroup();
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
  }, [
    newVisitContext,
    isValidatingVisitContext,
    newMutateVisitContext,
    setVisitContext,
    activeVisit,
    isValidatingActiveVisit,
    storePatientUuid,
    mutateActiveVisit,
    patient,
    t,
    launchLatestWorkspaceGroup,
  ]);

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
      visitContext,
      mutateVisitContext,
      isLoadingPatient,
      setPatient,
    }),
    [patient, patientUuid, visitContext, mutateVisitContext, isLoadingPatient, setPatient],
  );

  return state;
}
