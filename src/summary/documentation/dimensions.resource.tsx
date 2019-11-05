import { openmrsFetch } from "@openmrs/esm-api";

export function getPatientDimensions(
  patientIdentifer: string,
  abortController: AbortController
) {
  return openmrsFetch(
    `/ws/fhir/Observation?patient.identifier=${patientIdentifer}`,
    { signal: abortController.signal }
  );
}
