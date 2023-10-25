import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { WindowRef } from '../window-ref';
import { Location, ListResult } from '../types';

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

  public getUrl(searchText?: string) {
    return searchText
      ? this.windowRef.openmrsRestBase + `location?q=${searchText}&v=${LocationResourceService.v}`
      : this.windowRef.openmrsRestBase + 'location?v=' + LocationResourceService.v;
  }
}
