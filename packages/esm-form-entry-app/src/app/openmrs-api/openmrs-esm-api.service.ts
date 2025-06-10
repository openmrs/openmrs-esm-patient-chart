import { Injectable } from '@angular/core';
import { from, fromEventPattern, Observable } from 'rxjs';
import { getSessionStore, openmrsFetch, Session } from '@openmrs/esm-framework';

@Injectable()
export class OpenmrsEsmApiService {
  constructor() {}

  public getCurrentSession(): Observable<Session> {
    return fromEventPattern(
      (handler) => {
        const sessionStore = getSessionStore();
        handler(sessionStore.getState());
        sessionStore.subscribe((state) => handler(state));
      },
      (_, signal) => signal(),
    );
  }

  public openmrsFetch(url): Observable<any> {
    return from(openmrsFetch(url));
  }
}
