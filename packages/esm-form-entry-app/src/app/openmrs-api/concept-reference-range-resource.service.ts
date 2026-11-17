import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { chunk } from 'lodash-es';
import { EMPTY, Observable, forkJoin, of } from 'rxjs';
import { catchError, expand, map, reduce } from 'rxjs/operators';
import { WindowRef } from '../window-ref';
import { ConceptReferenceRange } from '../types';

interface ConceptReferenceRangeResponse {
  results: Array<ConceptReferenceRange>;
  links?: Array<{ rel: string; uri: string }>;
}

/**
 * How many concepts are requested at once. The requests are kept bounded so that a single concept
 * the backend cannot resolve only costs the ranges of its own batch instead of those of the whole
 * form.
 */
const conceptsPerRequest = 25;

@Injectable()
export class ConceptReferenceRangeResourceService {
  constructor(
    protected http: HttpClient,
    protected windowRef: WindowRef,
  ) {}

  public getUrl(): string {
    return this.windowRef.openmrsRestBase + 'conceptreferencerange';
  }

  /**
   * Fetches the reference ranges which apply to the given patient for the given concepts.
   *
   * @param patientUuid The patient the ranges are evaluated against.
   * @param concepts The concepts to fetch ranges for, expected to be resolved and deduplicated by
   * the caller. Concept references such as `CIEL:5089` are resolved by the backend as well.
   * @returns The ranges, keyed by concept UUID. Concepts without a range are omitted. Resolves to
   * an empty map if none of the ranges can be fetched, e.g. because the backend predates the
   * `conceptreferencerange` resource, which was added in OpenMRS Platform 2.7.
   */
  public getConceptReferenceRanges(
    patientUuid: string,
    concepts: Array<string>,
  ): Observable<Map<string, ConceptReferenceRange>> {
    if (!patientUuid || !concepts?.length) {
      return of(new Map<string, ConceptReferenceRange>());
    }

    return forkJoin(
      chunk(concepts, conceptsPerRequest).map((batch) => this.getConceptReferenceRangesOfBatch(patientUuid, batch)),
    ).pipe(
      map(
        (batches) =>
          new Map<string, ConceptReferenceRange>(
            batches
              .flat()
              .filter((referenceRange) => Boolean(referenceRange?.concept))
              .map((referenceRange) => [referenceRange.concept, referenceRange]),
          ),
      ),
    );
  }

  /**
   * Fetches the ranges of a single batch of concepts, following the `next` link until the backend
   * runs out of pages. The REST layer pages this resource, so a batch can span several responses
   * once it holds more concepts than the configured page size.
   *
   * A batch which cannot be fetched resolves to no ranges rather than failing, so that the ranges
   * of the remaining batches still reach the form.
   */
  private getConceptReferenceRangesOfBatch(
    patientUuid: string,
    concepts: Array<string>,
  ): Observable<Array<ConceptReferenceRange>> {
    const params: HttpParams = new HttpParams()
      .set('patient', patientUuid)
      .set('concept', concepts.join(','))
      .set('v', 'full');

    return this.http.get<ConceptReferenceRangeResponse>(this.getUrl(), { params }).pipe(
      expand((response) => {
        const nextPage = response?.links?.find((link) => link.rel === 'next');
        return nextPage ? this.http.get<ConceptReferenceRangeResponse>(nextPage.uri) : EMPTY;
      }),
      reduce(
        (referenceRanges, response) => referenceRanges.concat(response?.results ?? []),
        [] as Array<ConceptReferenceRange>,
      ),
      catchError((error) => {
        console.error(`Could not load the concept reference ranges of ${concepts.join(', ')}.`, error);
        return of([] as Array<ConceptReferenceRange>);
      }),
    );
  }
}
