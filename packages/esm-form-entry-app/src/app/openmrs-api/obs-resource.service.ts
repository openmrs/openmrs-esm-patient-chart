import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { WindowRef } from '../window-ref';
import { fhirBaseUrl } from '@openmrs/esm-framework';

@Injectable()
export class ObservationResourceService {
  constructor(protected http: HttpClient, protected windoRef: WindowRef) {}

  public getMostRecentObsValues(date, conceptUuids, patientUuid) {
    const url = `/openmrs${fhirBaseUrl}/Observation/$lastn`;
    let params = new HttpParams().set('patient', patientUuid).set('code', conceptUuids).set('max', 1);
    return this.http
      .get(url, {
        params,
      })
      .pipe(
        map((response: any) => {
          return response;
        }),
      );
  }
}
