import { type Encounter, restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';

export function useEncountersByVisit(patientUuid: string, visitUuid: string) {
  const customRepresentation =
    'custom:(uuid,encounterType:(uuid,display),encounterProviders:(provider:(person:(display))),encounterDatetime,visit:(uuid))';
  const url = `${restBaseUrl}/encounter?patient=${patientUuid}&order=desc&visit=${visitUuid}&v=${customRepresentation}`;
  const { data: encounters, ...rest } = useOpenmrsFetchAll<Encounter>(url);

  return {
    encounters,
    ...rest,
  };
}
