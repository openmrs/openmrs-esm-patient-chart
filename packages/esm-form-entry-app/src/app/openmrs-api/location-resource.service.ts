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
    const url = this.getUrl(uuid);
    return this.http.get<Location>(url).pipe(catchError(() => this.getLocationByUuidFallback(uuid)));
  }

  private getLocationByUuidFallback(uuid: string): Observable<Location | undefined> {
    return this.getAllLocations().pipe(map((locations) => locations.find((location) => location.uuid === uuid)));
  }

  public searchLocation(searchText: string): Observable<Array<Location>> {
    return this.getAllLocations().pipe(
      map((locations) =>
        locations.filter((location) => location.display.toLowerCase().includes(searchText.toLowerCase())),
      ),
    );
  }

  private getAllLocations(): Observable<Array<Location>> {
    const url = this.getUrl();
    return this.http.get<ListResult<Location>>(url).pipe(map((r) => r.results));
  }

  public getUrl(uuid?: string) {
    return uuid
      ? this.windowRef.openmrsRestBase + 'location/' + uuid + '?v=' + LocationResourceService.v
      : this.windowRef.openmrsRestBase + 'location?q=&v=' + LocationResourceService.v;
  }
}
