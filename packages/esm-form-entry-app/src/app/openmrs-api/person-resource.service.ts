import { Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WindowRef } from '../window-ref';
import { Person, PersonUpdate } from '../types';

@Injectable()
export class PersonResourceService {
  public v = 'full';

  constructor(
    protected http: HttpClient,
    private windowRef: WindowRef,
  ) {}

  public getUrl(): string {
    return this.windowRef.openmrsRestBase + 'person';
  }

  public getPersonByUuid(uuid: string, v: string = null): Observable<Person> {
    let url = this.getUrl();
    url += '/' + uuid;

    const params: HttpParams = new HttpParams().set('v', v && v.length > 0 ? v : this.v);
    return this.http.get<Person>(url, { params });
  }

  public saveUpdatePerson(uuid: string, payload: PersonUpdate): Observable<Person> | null {
    if (!payload || !uuid) {
      return null;
    }

    const url = `${this.getUrl()}/${uuid}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .post<{ person: Person }>(url, JSON.stringify(payload), { headers })
      .pipe(map((response) => response.person));
  }
}
