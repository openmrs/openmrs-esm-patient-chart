import { openmrsFetch } from "@openmrs/esm-api";

export function performPatientAllergySearch(
  patientIdentifer: string,
  abortController: AbortController
) {
  return openmrsFetch(
    `/ws/fhir/AllergyIntolerance?patient.identifier=${patientIdentifer}`,
    { signal: abortController.signal }
  );
}
