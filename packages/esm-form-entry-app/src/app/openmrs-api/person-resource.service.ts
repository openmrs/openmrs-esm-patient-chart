import { Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { WindowRef } from '../window-ref';

@Injectable()
export class PersonResourceService {
  public v = 'full';

  constructor(protected http: HttpClient, private windowRef: WindowRef) {}

  public getUrl(): string {
    return this.windowRef.openmrsRestBase + 'person';
  }

  public getPersonByUuid(uuid: string, v: string = null): Observable<any> {
    let url = this.getUrl();
    url += '/' + uuid;

    const params: HttpParams = new HttpParams().set('v', v && v.length > 0 ? v : this.v);
    return this.http.get(url, {
      params,
    });
  }

  public saveUpdatePerson(uuid, payload) {
    if (!payload || !uuid) {
      return null;
    }
    const url = this.getUrl() + '/' + uuid;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, JSON.stringify(payload), { headers }).pipe(
      map((response: any) => {
        return response.person;
      }),
    );
  }
}
