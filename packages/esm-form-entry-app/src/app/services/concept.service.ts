import { forkJoin, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WindowRef } from '../window-ref';
import { ListResult } from '../types';
import { map } from 'rxjs/operators';

interface ConceptMetadata {
  uuid: string;
  display: string;
}

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

  public searchBulkConceptByUUID(conceptUuids: Array<string>, lang: string): Observable<Array<ConceptMetadata>> {
    const chunkSize = 50;
    const observablesArray = [];
    const slicedConceptUuids = conceptUuids.reduceRight((acc, currentValue, i, array) => [...acc, array.splice(0, chunkSize)], []);

    for (const conceptUuidsChunk of slicedConceptUuids) {
      observablesArray.push(
        this.http
          .get<ListResult<ConceptMetadata>>(this.getUrl() + `?references=` + conceptUuidsChunk.join(','), {
            headers: this.headers,
          })
          .pipe(
            map((r) => {
              return r.results;
            }),
          ),
      );
    }

    return forkJoin(observablesArray).pipe(
      map((response) => {
        return response.flat() as Array<ConceptMetadata>;
      }),
    );
  }
}
