import { openmrsObservableFetch, fhirBaseUrl } from "@openmrs/esm-framework";
import { map } from "rxjs/operators";
import { FHIRCondition } from "../types";

export function performPatientConditionsSearch(patientIdentifier: string) {
  return openmrsObservableFetch<Array<Condition>>(
    `${fhirBaseUrl}/Condition?patient.identifier=${patientIdentifier}`
  ).pipe(
    map(({ data }) => data["entry"]),
    map(entries => entries?.map(entry => entry.resource) ?? []),
    map(data => formatConditions(data)),
    map(data =>
      data.sort((a, b) => (b?.onsetDateTime > a?.onsetDateTime ? 1 : -1))
    )
  );
}

export function getConditionByUuid(conditionUuid: string) {
  return openmrsObservableFetch(
    `${fhirBaseUrl}/Condition/${conditionUuid}`
  ).pipe(
    map(({ data }) => data),
    map((data: FHIRCondition) => mapConditionProperties(data))
  );
}

function formatConditions(conditions: Array<FHIRCondition>): Array<Condition> {
  return conditions.map(mapConditionProperties);
}

function mapConditionProperties(condition: FHIRCondition): Condition {
  return {
    clinicalStatus: condition?.clinicalStatus?.coding[0]?.code,
    conceptId: condition?.code?.coding[0]?.code,
    display: condition?.code?.coding[0]?.display,
    onsetDateTime: condition?.onsetDateTime,
    recordedDate: condition?.recordedDate,
    id: condition?.id
  };
}

export function createPatientCondition(
  patientCondition,
  patientUuid,
  abortController
) {
  return Promise.resolve({ status: 201, body: "Condition created" });
}

export function updatePatientCondition(
  patientCondition,
  patientUuid,
  abortController
) {
  return Promise.resolve({ status: 200, body: "Ok" });
}

export type Condition = {
  clinicalStatus: string;
  conceptId: string;
  display: string;
  onsetDateTime: string;
  recordedDate: string;
  id: string;
};
