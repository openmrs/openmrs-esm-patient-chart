import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { getCurrentUser, openmrsObservableFetch, Session } from '@openmrs/esm-framework';

@Injectable()
export class OpenmrsEsmApiService {
  constructor() {}

  public getCurrentSession(): Observable<Session> {
    return getCurrentUser();
  }

  public openmrsFetch(url): Observable<any> {
    return openmrsObservableFetch(url);
  }
}
