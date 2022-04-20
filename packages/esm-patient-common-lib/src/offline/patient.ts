import { usePatient, getSynchronizationItems } from '@openmrs/esm-framework';
import useSWR from 'swr';

export const patientRegistrationSyncType = 'patient-registration';

/**
 * A hook similar to {@link usePatient} which also considers patients which have been newly registered
 * in offline mode by the patient registration module.
 */
export function usePatientOrOfflineRegisteredPatient(patientUuid: string): ReturnType<typeof usePatient> {
  const onlinePatientState = usePatient(patientUuid);
  const offlinePatientState = useSWR(`offlineRegisteredPatient/${patientUuid}`, async () => {
    const offlinePatient = await getOfflineRegisteredPatientAsFhirPatient(patientUuid);
    if (!offlinePatient) {
      throw new Error(`No offline registered patient could be found. UUID: ${patientUuid}`);
    }

    return offlinePatient;
  });

  if (onlinePatientState.isLoading || (!offlinePatientState.data && !offlinePatientState.error)) {
    return {
      isLoading: true,
      patient: null,
      patientUuid,
      error: null,
    };
  }

  if (onlinePatientState.patient && !(onlinePatientState.patient as any).issue) {
    return {
      isLoading: false,
      patient: onlinePatientState.patient,
      patientUuid,
      error: null,
    };
  }

  if (offlinePatientState.data) {
    return {
      isLoading: false,
      patient: offlinePatientState.data,
      patientUuid,
      error: null,
    };
  }

  return {
    isLoading: false,
    patient: null,
    patientUuid,
    error: onlinePatientState.error ?? offlinePatientState.error,
  };
}

async function getOfflineRegisteredPatientAsFhirPatient(patientUuid: string): Promise<fhir.Patient | undefined> {
  const patientRegistrationSyncItems = await getSynchronizationItems<any>(patientRegistrationSyncType);
  const patientSyncItem = patientRegistrationSyncItems.find((item) => item.fhirPatient.id === patientUuid);
  return patientSyncItem.fhirPatient;
}
