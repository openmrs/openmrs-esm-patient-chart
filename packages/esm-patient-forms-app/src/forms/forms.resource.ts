import { openmrsObservableFetch } from "@openmrs/esm-framework";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Encounter, Form } from "../types";
import uniqBy from "lodash-es/uniqBy";

interface searchResponse {
  results: Array<Form>;
}

export function fetchAllForms(): Observable<Array<Form>> {
  return openmrsObservableFetch<searchResponse>(
    `/ws/rest/v1/form?v=custom:(uuid,name,encounterType:(uuid,name),version,published,retired,resources:(uuid,name,dataType,valueReference))`
  ).pipe(
    map(({ data }) => data),
    map(({ results }) => results.map((form) => toFormObject(form)))
  );
}

export function toFormObject(openmrsRestForm): Form {
  return {
    uuid: openmrsRestForm.uuid,
    name: openmrsRestForm.name || openmrsRestForm.display,
    published: openmrsRestForm.published,
    retired: openmrsRestForm.retired,
    encounterTypeUuid: openmrsRestForm.encounterType
      ? openmrsRestForm.encounterType.uuid
      : null,
    encounterTypeName: openmrsRestForm.encounterType
      ? openmrsRestForm.encounterType.name
      : null,
    lastCompleted: null,
  };
}

export function fetchPatientEncounters(
  patientUuid: string,
  startDate: Date,
  endDate: Date
): Observable<Array<Encounter>> {
  const customRepresentation = `custom:(uuid,encounterDatetime,encounterType:(uuid,name),form:(uuid,name,encounterType:(uuid,name),version,published,retired,resources:(uuid,name,dataType,valueReference))`;
  return openmrsObservableFetch<searchResponse>(
    `/ws/rest/v1/encounter?v=${customRepresentation}&patient=${patientUuid}&fromdate=${startDate.toISOString()}&todate=${endDate.toISOString()}`
  ).pipe(
    map(({ data }) => data),
    map(({ results }) => results.map((result) => toEncounterObject(result))),
    map((encounters) => {
      return uniqBy(
        encounters
          .filter((encounter) => encounter.form !== null)
          .sort(
            (encounterA, encounterB) =>
              encounterB.encounterDateTime.getTime() -
              encounterA.encounterDateTime.getTime()
          ),
        "form.uuid"
      );
    })
  );
}

export function toEncounterObject(openmrsRestEncounter: any): Encounter {
  return {
    uuid: openmrsRestEncounter.uuid,
    encounterDateTime: new Date(openmrsRestEncounter.encounterDatetime),
    encounterTypeUuid: openmrsRestEncounter.encounterType
      ? openmrsRestEncounter.encounterType.uuid
      : null,
    encounterTypeName: openmrsRestEncounter.encounterType
      ? openmrsRestEncounter.encounterType.name
      : null,
    form: openmrsRestEncounter.form
      ? toFormObject(openmrsRestEncounter.form)
      : null,
  };
}
