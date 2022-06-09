import { forkJoin as observableForkJoin, of as observableOf, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WindowRef } from '../window-ref';

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
    return this.http
      .get(this.getUrl() + `/${conceptUUID}?v=full&lang=${lang}`, {
        headers: this.headers,
      })
      .pipe(
        catchError((error: Response) => {
          console.error(error.status);
          return observableOf(error.json());
        }),
      );
  }

  public searchBulkConceptByUUID(conceptUuids: any, lang: string) {
    const observablesArray = [];
    _.each(conceptUuids, (conceptUuid) => {
      observablesArray.push(
        this.searchConceptByUUID(conceptUuid, lang).pipe(
          map((concept) => {
            return { ...concept, extId: conceptUuid };
          }),
          catchError((error: Response) => {
            console.error(error.status);
            return observableOf({ extId: conceptUuid, display: conceptUuid });
          }),
        ),
      );
    });
    return observableForkJoin(observablesArray);
  }
}
