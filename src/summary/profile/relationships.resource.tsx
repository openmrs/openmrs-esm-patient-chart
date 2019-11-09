import { openmrsFetch } from "@openmrs/esm-api";

export function fetchPatientRelationships(patientIdentifier: string) {
  return openmrsFetch(
    `/ws/fhir/RelatedPerson?patient.identifier=${patientIdentifier}`
  );
}
