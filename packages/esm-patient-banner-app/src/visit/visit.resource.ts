import { openmrsObservableFetch, FetchResponse } from "@openmrs/esm-framework";
import { Observable } from "rxjs";
import { take, map } from "rxjs/operators";
import { OpenmrsResource, Location, VisitType } from "../types";

export interface NewVisitPayload {
  location: string;
  patient?: string;
  startDatetime: Date;
  visitType: string;
  stopDatetime?: Date;
}

export type UpdateVisitPayload = NewVisitPayload & {};

export interface Visit {
  uuid: string;
  display?: string;
  encounters: Array<OpenmrsResource>;
  patient?: OpenmrsResource;
  visitType: VisitType;
  location?: Location;
  startDatetime: Date;
  stopDatetime?: Date;
  attributes?: Array<OpenmrsResource>;
  [anythingElse: string]: any;
}

export function getVisitsForPatient(
  patientUuid: string,
  abortController: AbortController,
  v?: string
): Observable<FetchResponse<{ results: Array<Visit> }>> {
  const custom =
    v ||
    "custom:(uuid,encounters:(uuid,encounterDatetime," +
      "form:(uuid,name),location:ref," +
      "encounterType:ref,encounterProviders:(uuid,display," +
      "provider:(uuid,display))),patient:(uuid,uuid)," +
      "visitType:(uuid,name,display),attributes:(uuid,display,value),location:(uuid,name,display),startDatetime," +
      "stopDatetime)";

  return openmrsObservableFetch(
    `/ws/rest/v1/visit?patient=${patientUuid}&v=${custom}`,
    {
      signal: abortController.signal,
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    }
  )
    .pipe(take(1))
    .pipe(
      map((response: FetchResponse<{ results: Array<Visit> }>) => {
        return response;
      })
    );
}

export function saveVisit(
  payload: NewVisitPayload,
  abortController: AbortController
): Observable<FetchResponse<any>> {
  return openmrsObservableFetch(`/ws/rest/v1/visit`, {
    signal: abortController.signal,
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: payload,
  });
}

export function updateVisit(
  uuid: string,
  payload: UpdateVisitPayload,
  abortController: AbortController
): Observable<any> {
  return openmrsObservableFetch(`/ws/rest/v1/visit/${uuid}`, {
    signal: abortController.signal,
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: payload,
  });
}
