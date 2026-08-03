import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { WindowRef } from '../window-ref';
import { ConceptReferenceRange } from '../types';

interface ConceptReferenceRangeResponse {
  results: Array<ConceptReferenceRange>;
}

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
   * @param conceptReferences The concepts to fetch ranges for. These can be UUIDs or concept
   * references such as `CIEL:5089`, both of which are resolved by the backend.
   * @returns The ranges, keyed by concept UUID. Concepts without a range are omitted. Resolves to
   * an empty map if the ranges cannot be fetched, e.g. because the backend predates the
   * `conceptreferencerange` resource, which was added in OpenMRS Platform 2.7.
   */
  public getConceptReferenceRanges(
    patientUuid: string,
    conceptReferences: Array<string>,
  ): Observable<Map<string, ConceptReferenceRange>> {
    if (!patientUuid || !conceptReferences?.length) {
      return of(new Map<string, ConceptReferenceRange>());
    }

    const params: HttpParams = new HttpParams()
      .set('patient', patientUuid)
      .set('concept', conceptReferences.join(','))
      .set('v', 'full');

    return this.http.get<ConceptReferenceRangeResponse>(this.getUrl(), { params }).pipe(
      map(
        (response) =>
          new Map<string, ConceptReferenceRange>(
            (response?.results ?? [])
              .filter((referenceRange) => Boolean(referenceRange?.concept))
              .map((referenceRange) => [referenceRange.concept, referenceRange]),
          ),
      ),
      catchError((error) => {
        console.error('Could not load the concept reference ranges for this form.', error);
        return of(new Map<string, ConceptReferenceRange>());
      }),
    );
  }
}
