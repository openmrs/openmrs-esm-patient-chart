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
  const [offlinePatientState, setOfflinePatientState] = useState<{ patient?: fhir.Patient; error?: Error }>({
    patient: undefined,
    error: undefined,
  });

  useEffect(() => {
    if (isOnline) {
      setOfflinePatientState({ error: undefined, patient: undefined });
    } else {
      getOfflineRegisteredPatientAsFhirPatient(patientUuid)
        .then((offlinePatient) => {
          setOfflinePatientState({ error: undefined, patient: offlinePatient });
        })
        .catch((err) => {
          if (err instanceof Error) {
            setOfflinePatientState({ error: err, patient: undefined });
          } else {
            setOfflinePatientState({ error: new Error(JSON.stringify(err)), patient: undefined });
          }
        });
    }
  }, [patientUuid, isOnline]);

  return useMemo(() => {
    if (isOnline) {
      if (onlinePatientState.patient && onlinePatientState.patient.hasOwnProperty('issue')) {
        const operationOutcome = onlinePatientState.patient as fhir.OperationOutcome;
        return {
          ...onlinePatientState,
          patient: undefined,
          error: new Error(JSON.stringify(operationOutcome.issue)),
        };
      } else {
        return onlinePatientState;
      }
    } else {
      return {
        isLoading: !(!!offlinePatientState.patient || !!offlinePatientState.error),
        patient: offlinePatientState.patient,
        patientUuid: offlinePatientState.patient?.id,
        error: offlinePatientState.error,
      };
    }
  }, [isOnline, onlinePatientState, offlinePatientState.patient, offlinePatientState.error]);
}

async function getOfflineRegisteredPatientAsFhirPatient(patientUuid: string): Promise<fhir.Patient | undefined> {
  const patientRegistrationSyncItems = await getSynchronizationItems<any>(patientRegistrationSyncType);
  const patientSyncItem = patientRegistrationSyncItems.find((item) => item.fhirPatient?.id === patientUuid);
  return patientSyncItem.fhirPatient;
}
