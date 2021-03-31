export * from "./fhir-resource";
export * from "./openmrs-resource";

export interface Location {
  uuid: string;
  display?: string;
  name?: string;
}

export interface VisitType {
  uuid: string;
  display: string;
  name?: string;
}
