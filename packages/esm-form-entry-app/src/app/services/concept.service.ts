import { forkJoin as observableForkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WindowRef } from '../window-ref';
import { Concept } from '../types';

@Injectable()
export class ConceptService {
  private headers = new HttpHeaders({
    accept: 'application/json',
  });

  constructor(private http: HttpClient, private windowRef: WindowRef) {}

  public getUrl(): string {
    return this.windowRef.openmrsRestBase + 'concept';
  }

  public searchConceptByUUID(conceptUUID: string, lang: string): Observable<any> {
    return this.http.get(this.getUrl() + `/${conceptUUID}?v=full&lang=${lang}`, {
      headers: this.headers,
    });
  }

  public searchBulkConceptByUUID(
    conceptUuids: Array<string>,
    lang: string,
  ): Observable<Array<Concept & { extId: string }>> {
    const observablesArray = [];

    for (const conceptUuid of conceptUuids) {
      observablesArray.push(
        this.searchConceptByUUID(conceptUuid, lang).pipe(
          map((concept) => {
            return { ...concept, extId: conceptUuid };
          }),
          catchError((error: Response) => {
            console.error(error.status);
            return of({ extId: conceptUuid, display: 'Failed to load concept label' });
          }),
        ),
      );
    }

    return observableForkJoin(observablesArray) as Observable<Array<Concept & { extId: string }>>;
  }
}
