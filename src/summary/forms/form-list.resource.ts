import { openmrsObservableFetch } from "@openmrs/esm-api";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export function getAllForms(): Observable<Array<Form>> {
  return openmrsObservableFetch(
    `/ws/rest/v1/form?v=custom:(uuid,name,encounterType:(uuid,name),version,published,retired,resources:(uuid,name,dataType,valueReference))&q=POC`
  ).pipe(
    map(results => {
      const forms: Form[] = results["data"]["results"].map(form => {
        const transformed: Form = {
          uuid: form.uuid,
          name: form.name
        };
        return transformed;
      });
      return forms;
    })
  );
}

export type Form = {
  uuid: string;
  name: string;
};
