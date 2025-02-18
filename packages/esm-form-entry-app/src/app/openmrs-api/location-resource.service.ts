import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { WindowRef } from '../window-ref';
import { Location, ListResult } from '../types';
import capitalize from 'lodash/capitalize';

@Injectable()
export class LocationResourceService {
  private static readonly v = 'custom:(uuid,display)';

  constructor(
    protected http: HttpClient,
    protected windowRef: WindowRef,
  ) {}

  public getLocationByUuid(uuid: string): Observable<Location | undefined> {
    const url = this.getLocationByUuidUrl(uuid);
    return this.http.get<Location>(url).pipe(catchError(() => this.getLocationByUuidFallback(uuid)));
  }

  private getLocationByUuidFallback(uuid: string): Observable<Location | undefined> {
    return this.getAllLocations().pipe(map((locations) => locations.find((location) => location.uuid === uuid)));
  }

  public searchLocation(searchText: string): Observable<Array<Location>> {
    return this.getAllLocations(searchText);
  }

  public getAllLocations(searchText?: string): Observable<Array<Location>> {
    let url = '';
    searchText ? (url = this.getUrl(searchText)) : (url = this.getUrl());
    return this.http.get<ListResult<Location>>(url).pipe(map((r) => r.results));
  }

  public getLocationByUuidUrl(uuid?: string) {
    if (uuid) {
      return this.windowRef.openmrsRestBase + 'location/' + uuid + '?v=' + LocationResourceService.v;
    }
  }

  /**
   * Fetches locations from FHIR server based on tag and optional name search
   * @param tag - The location tag to filter by
   * @param locationName - Optional name to search for (defaults to empty string)
   * @returns Observable of locations with uuid and display name
   */
  public fetchFhirLocationsByTagAndName(
    tag: string,
    locationName: string = '',
  ): Observable<Array<{ uuid: string; display: string }>> {
    const fhirBaseUrl: string = this.windowRef.openmrsFhirBase;
    const url: string = `${fhirBaseUrl}/Location?_summary=data&_count=50&_tag=${tag}&name%3Acontains=${locationName}`;

    return this.http.get<{ entry?: Array<{ resource: { id: string; name: string } }> }>(url).pipe(
      map(
        (r) =>
          r?.['entry']?.map(({ resource }) => ({
            uuid: resource.id,
            display: capitalize(resource.name),
          })) ?? [],
      ),
    );
  }

  public getUrl(searchText?: string) {
    return searchText
      ? this.windowRef.openmrsRestBase + `location?q=${searchText}&v=${LocationResourceService.v}`
      : this.windowRef.openmrsRestBase + 'location?v=' + LocationResourceService.v;
  }
}
