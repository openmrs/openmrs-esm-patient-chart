import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { WindowRef } from '../window-ref';
import { GetLocation, ListResult } from './types';

@Injectable()
export class LocationResourceService {
  private static readonly v = 'custom:(uuid,display)';

  constructor(protected http: HttpClient, protected windowRef: WindowRef) {}

  public getLocationByUuid(uuid: string): Observable<GetLocation | undefined> {
    const url = this.getUrl(uuid);
    return this.http.get<GetLocation>(url).pipe(catchError(() => this.getLocationByUuidFallback(uuid)));
  }

  private getLocationByUuidFallback(uuid: string): Observable<GetLocation | undefined> {
    return this.getAllLocations().pipe(map((locations) => locations.find((location) => location.uuid === uuid)));
  }

  public searchLocation(searchText: string): Observable<Array<GetLocation>> {
    return this.getAllLocations().pipe(
      map((locations) =>
        locations.filter((location) => location.display.toLowerCase().includes(searchText.toLowerCase())),
      ),
    );
  }

  private getAllLocations(): Observable<Array<GetLocation>> {
    const url = this.getUrl();
    return this.http.get<ListResult<GetLocation>>(url).pipe(map((r) => r.results));
  }

  public getUrl(uuid?: string) {
    return uuid
      ? this.windowRef.openmrsRestBase + 'location/' + uuid + '?v=' + LocationResourceService.v
      : this.windowRef.openmrsRestBase + 'location?q=&v=' + LocationResourceService.v;
  }
}
