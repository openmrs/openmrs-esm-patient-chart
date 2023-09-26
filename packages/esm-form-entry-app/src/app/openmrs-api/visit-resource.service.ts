import { Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { WindowRef } from '../window-ref';
import { Visit } from '../types';

@Injectable()
export class VisitResourceService {
  public v = 'full';

  constructor(
    protected http: HttpClient,
    private windowRef: WindowRef,
  ) {}

  public getUrl(): string {
    return this.windowRef.openmrsRestBase + 'visit';
  }

  public getVisitStartStopTime(uuid: string, v: string = null): Observable<any> {
    let url = this.getUrl();
    url += '/' + uuid + '?v=custom:(uuid,startDatetime,stopDatetime)&includeInactive=false';

    const params: HttpParams = new HttpParams().set('v', v && v.length > 0 ? v : this.v);
    return this.http.get<Visit>(url, { params });
  }

  public updateVisit(uuid: string, payload: any): Observable<any> {
    if (!payload) {
      return null;
    }

    let url = this.getUrl();
    url += '/' + uuid;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Visit>(url, JSON.stringify(payload), { headers });
  }

  public updateVisitDates(uuid: string, startDatetime: string, stopDatetime: string): Observable<any> {
    if (!startDatetime && !stopDatetime) {
      return null;
    }

    let url = this.getUrl();
    url += '/' + uuid;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Visit>(
      url,
      JSON.stringify({ uuid: uuid, startDatetime: startDatetime, stopDatetime: stopDatetime }),
      { headers },
    );
  }
}
