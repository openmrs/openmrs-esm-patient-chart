import { useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, usePatient, useVisit, type Visit } from '@openmrs/esm-framework';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';

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
  const { isLoading: isLoadingPatient, patient } = usePatient(patientUuid);
  const {
    patientUuid: storePatientUuid,
    setPatient,
    visitContext,
    mutateVisitContext,
    setVisitContext,
  } = usePatientChartStore(patientUuid);

  const isVisitContextValid = visitContext && visitContext.patient.uuid === patientUuid;
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

  useEffect(() => {
    if (!isValidatingVisitContext && !isValidatingActiveVisit && storePatientUuid) {
      if (activeVisit) {
        setVisitContext(activeVisit, mutateActiveVisit);
      } else if (newVisitContext) {
        setVisitContext(newVisitContext, newMutateVisitContext);
      } else {
        setVisitContext(null, null);
      }
    }
  }, [
    newVisitContext,
    isValidatingVisitContext,
    newMutateVisitContext,
    setVisitContext,
    activeVisit,
    isValidatingActiveVisit,
    storePatientUuid,
    mutateActiveVisit,
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
    }),
    [patient, patientUuid, visitContext, mutateVisitContext, isLoadingPatient],
  );

  return state;
}
