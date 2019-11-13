import { openmrsFetch } from "@openmrs/esm-api";

const HEIGHT_CONCEPT = "5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const WEIGHT_CONCEPT = "5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export function getHeight(patientId) {
  return openmrsFetch(
    `/ws/fhir/Observation?subject:Patient=${patientId}&code=${HEIGHT_CONCEPT}`
  );
}

export function getWeight(patientId) {
  return openmrsFetch(
    `/ws/fhir/Observation?subject:Patient=${patientId}&code=${WEIGHT_CONCEPT}`
  );
}
