import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { getCurrentUser, openmrsObservableFetch } from '@openmrs/esm-framework';

@Injectable()
export class OpenmrsEsmApiService {
  constructor() {}

  public getCurrentUser(): Observable<any> {
    return getCurrentUser();
  }
  public openmrsFetch(url): Observable<any> {
    return openmrsObservableFetch(url);
  }

  public getCurrentUserLocation(): Observable<any> {
    return this.openmrsFetch('/ws/rest/v1/session').pipe(map((resp) => resp.data));
  }
}
