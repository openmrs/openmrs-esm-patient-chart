import { forkJoin, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WindowRef } from '../window-ref';

interface ConceptReferencesResult {
  [key: string]: ConceptMetadata;
}

interface ConceptMetadata {
  identifier: string;
  display: string;
}

const chunkSize = 100;

@Injectable()
export class ConceptService {
  private headers = new HttpHeaders({
    accept: 'application/json',
  });

  constructor(
    private http: HttpClient,
    private windowRef: WindowRef,
  ) {}

  public searchConceptsByIdentifiers(conceptIdentifiers: Array<string>) {
    return of(ConceptService.getConceptReferenceUrls(conceptIdentifiers))
      .pipe(
        mergeMap((referenceUrl) =>
          forkJoin(
            referenceUrl.map((url) =>
              this.http
                .get<ConceptReferencesResult>(this.windowRef.openmrsRestBase + url, {
                  headers: this.headers,
                })
                .pipe(
                  map((result) =>
                    Object.entries(result).reduce((acc, reference) => {
                      acc.push({
                        identifier: reference[0],
                        display: reference[1].display,
                      });

                      return acc;
                    }, [] as Array<ConceptMetadata>),
                  ),
                )
                .toPromise(),
            ),
          ),
        ),
      )
      .pipe(map((r) => r.flat()));
  }

  /**
   * Partitions the given concept identifiers into relative URLs pointing to the concept
   * bulk fetching endpoint.
   * @param conceptIdentifiers The concept identifiers to be chunked
   */
  public static getConceptReferenceUrls(conceptIdentifiers: Array<string>) {
    const accumulator = [];
    for (let i = 0; i < conceptIdentifiers.length; i += chunkSize) {
      accumulator.push(conceptIdentifiers.slice(i, i + chunkSize));
    }

    return accumulator.map(
      (partition) => `conceptreferences?references=${partition.join(',')}&v=custom:(uuid,display)`,
    );
  }
}
