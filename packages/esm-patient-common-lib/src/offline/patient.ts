import { useEffect, useMemo, useState } from 'react';
import { usePatient, getSynchronizationItems, useConnectivity } from '@openmrs/esm-framework';

export const patientRegistrationSyncType = 'patient-registration';

/**
 * A hook similar to {@link usePatient} which also considers patients which have been newly registered
 * in offline mode by the patient registration module.
 */
export function usePatientOrOfflineRegisteredPatient(patientUuid: string): ReturnType<typeof usePatient> {
  const isOnline = useConnectivity();
  const onlinePatientState = usePatient(patientUuid);
  const [offlinePatientState, setOfflinePatientState] = useState<{ data: fhir.Patient | null; error: Error | null }>({
    data: null,
    error: null,
  });

  useEffect(() => {
    if (isOnline) {
      setOfflinePatientState({ error: null, data: null });
    } else {
      getOfflineRegisteredPatientAsFhirPatient(patientUuid)
        .then((offlinePatient) => {
          setOfflinePatientState({ error: null, data: offlinePatient });
        })
        .catch((err) => {
          setOfflinePatientState({ error: err, data: null });
        });
    }
  }, [patientUuid, isOnline]);

  return useMemo(() => {
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
  }, [onlinePatientState, offlinePatientState.data, offlinePatientState.error, patientUuid]);
}

async function getOfflineRegisteredPatientAsFhirPatient(patientUuid: string): Promise<fhir.Patient | undefined> {
  const patientRegistrationSyncItems = await getSynchronizationItems<any>(patientRegistrationSyncType);
  const patientSyncItem = patientRegistrationSyncItems.find((item) => item.fhirPatient?.id === patientUuid);
  return patientSyncItem.fhirPatient;
}
