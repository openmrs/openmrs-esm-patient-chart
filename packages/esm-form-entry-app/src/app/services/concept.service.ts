import { forkJoin, Observable } from 'rxjs';
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

  public searchBulkConceptsByUUID(conceptUuids: Array<string>, lang: string): Observable<Array<ConceptMetadata>> {
    const observablesArray = [];
    const relativeConceptLabelUrls = ConceptService.getRelativeConceptLabelUrls(conceptUuids, lang);

    for (const relativeConceptLabelUrl of relativeConceptLabelUrls) {
      observablesArray.push(
        this.http
          .get<ListResult<ConceptMetadata>>(this.windowRef.openmrsRestBase + relativeConceptLabelUrl, {
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

  /**
   * Partitions the given concept UUIDs into relative URLs pointing to the concept
   * bulk fetching endpoint.
   * @param conceptUuids The concept UUIDs to be partitioned into bulk fetching URLs.
   */
  public static getRelativeConceptLabelUrls(conceptUuids: Array<string>, lang: string) {
    const chunkSize = 100;
    return [...new Set(conceptUuids)]
      .reduceRight((acc, _, __, array) => [...acc, array.splice(0, chunkSize)], [])
      .map((uuidPartition) => `concept?references=${uuidPartition.join(',')}`);
  }
}
