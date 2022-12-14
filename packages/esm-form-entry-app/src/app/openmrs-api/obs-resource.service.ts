import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';
import { fhirBaseUrl, openmrsObservableFetch } from '@openmrs/esm-framework';

@Injectable()
export class ObservationResourceService {
  public openmrsFetch(url): Observable<any> {
    return openmrsObservableFetch(url);
  }

  public getMostRecentObsValues(date, conceptUuids, patientUuid) {
    return this.openmrsFetch(
      `${fhirBaseUrl}/Observation/$lastn?patient=${patientUuid}&code=${conceptUuids}&max=1&date=${date}`,
    ).pipe(map((response) => response));
  }
}
