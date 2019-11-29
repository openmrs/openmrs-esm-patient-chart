import { openmrsFetch } from "@openmrs/esm-api";

export function getEncounters(
  patientIdentifer: string,
  abortController: AbortController
) {
  return openmrsFetch(
    `/ws/fhir/Encounter?patient.identifier=${patientIdentifer}`,
    {
      signal: abortController.signal
    }
  );
}
