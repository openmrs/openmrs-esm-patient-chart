import { Injectable } from '@angular/core';
import { from, fromEventPattern, Observable } from 'rxjs';
import { getSessionStore, openmrsFetch, Session } from '@openmrs/esm-framework';

@Injectable()
export class OpenmrsEsmApiService {
  constructor() {}

  public getCurrentSession(): Observable<Session> {
    return new Observable<Session>((observer) => {
      const sessionStore = getSessionStore();
      const state = sessionStore.getState();
      if (state.loaded) {
        observer.next(state.session);
      }

      const unsubscribe = sessionStore.subscribe((state) => state.loaded && observer.next(state.session));
      return () => unsubscribe();
    });
  }

  public openmrsFetch(url): Observable<any> {
    return from(openmrsFetch(url));
  }
}
