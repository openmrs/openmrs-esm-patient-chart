import { openmrsFetch } from "@openmrs/esm-api";

export function performPatientAllergySearch(patientIdentifer: string) {
  return openmrsFetch(
    `/ws/fhir/AllergyIntolerance?patient.identifier=${patientIdentifer}`
  );
}
