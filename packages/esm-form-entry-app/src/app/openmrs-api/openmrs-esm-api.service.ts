import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getCurrentUser, LoggedInUser, openmrsObservableFetch, Session } from '@openmrs/esm-framework';

@Injectable()
export class OpenmrsEsmApiService {
  constructor() {}

  public getCurrentUser(): Observable<LoggedInUser> {
    return getCurrentUser().pipe(map((session: Session) => session.user));
  }

  public openmrsFetch(url): Observable<any> {
    return openmrsObservableFetch(url);
  }
}
