import { openmrsFetch } from "@openmrs/esm-api";

export function getEncounters(
  patientIdentifer: string,
  abortController: AbortController
) {
  return openmrsFetch(`/ws/fhir/Encounter?identifier=${patientIdentifer}`, {
    signal: abortController.signal
  });
}
export function getEncounterById(encounterId: string) {
  return openmrsFetch(`/ws/fhir/Encounter?${encounterId}`);
}
export function getEncounterByUuid(encounterUuid: string) {
  return openmrsFetch(`/ws/fhir/Encounter?_id=${encounterUuid}`);
}
export function searchEncounterByPatientIdentifierWithMatchingVisit(
  patientIdentifer: string,
  visitUuid: string
) {
  return openmrsFetch(
    `/ws/fhir/Encounter?identifier=${patientIdentifer},part-of=${visitUuid}`
  );
}
