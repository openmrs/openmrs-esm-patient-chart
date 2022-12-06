import { of } from 'rxjs';
import { concatAll, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WindowRef } from '../window-ref';

interface ConceptReferencesResult {
  [key: string]: ConceptMetadata;
}

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

  public searchConceptsByIdentifiers(conceptIdentifiers: Array<string>) {
    return of(...ConceptService.getConceptReferenceUrls(conceptIdentifiers)).pipe(
      map((referenceUrl) =>
        this.http
          .get<ConceptReferencesResult>(this.windowRef.openmrsRestBase + referenceUrl + '?v=custom:(uuid,display)', {
            headers: this.headers,
          })
          .pipe(
            map((result) =>
              Object.entries(result).reduce((acc, reference) => {
                acc.push({
                  uuid: reference[0],
                  display: reference[1].display,
                });

                return acc;
              }, [] as ConceptMetadata[]),
            ),
          ),
      ),
      concatAll(),
    );
  }

  /**
   * Partitions the given concept identifiers into relative URLs pointing to the concept
   * bulk fetching endpoint.
   * @param conceptIdentifiers The concept identifiers to be chunked
   */
  public static getConceptReferenceUrls(conceptIdentifiers: Array<string>) {
    const chunkSize = 100;
    return [...new Set(conceptIdentifiers)]
      .reduceRight((acc, _, __, array) => [...acc, array.splice(0, chunkSize)], [])
      .map((partition) => `conceptreferences?references=${partition.join(',')}`);
  }
}
