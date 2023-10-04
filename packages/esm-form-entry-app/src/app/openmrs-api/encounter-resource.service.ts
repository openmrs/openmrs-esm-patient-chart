import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

import { of as observableOf, Observable } from 'rxjs';
import { map, flatMap, catchError } from 'rxjs/operators';
import { WindowRef } from '../window-ref';
import { Encounter } from '../types';

@Injectable()
export class EncounterResourceService {
  public v: string =
    'custom:(uuid,encounterDatetime,' +
    'patient:(uuid,uuid),form:(uuid,name),' +
    'visit:(uuid,display,auditInfo,startDatetime,stopDatetime,location:(uuid,display)' +
    ',visitType:(uuid,name)),' +
    'location:ref,encounterType:ref,encounterProviders:(uuid,display,provider:(uuid,display)))';

  constructor(
    protected http: HttpClient,
    protected windoRef: WindowRef,
  ) {}

  public getUrl(): string {
    return this.windoRef.openmrsRestBase;
  }

  public getEncountersByPatientUuid(
    patientUuid: string,
    cached: boolean = false,
    v: string = null,
  ): Observable<Array<Encounter>> {
    if (!patientUuid) {
      return null;
    }
    const url = this.getUrl() + 'encounter';
    let params = new HttpParams().set('patient', patientUuid).set('v', this.v);

    return this.http
      .get(url, {
        params,
      })
      .pipe(
        flatMap((encounters: any) => {
          if (encounters.results.length >= 500) {
            params = params.set('startIndex', '500');
            return this.http
              .get<any>(url, {
                params,
              })
              .pipe(
                map((res) => {
                  return encounters.results.concat(res.results);
                }),
              );
          } else {
            return observableOf(encounters.results);
          }
        }),
      );
  }

  public getEncounterByUuid(uuid: string): Observable<Encounter> {
    if (!uuid) {
      return null;
    }
    const customDefaultRep =
      'custom:(uuid,encounterDatetime,' +
      'patient:(uuid,uuid,person,identifiers:full),form:(uuid,name),' +
      'visit:(uuid,visitType,display,startDatetime,stopDatetime),' +
      'location:ref,encounterType:ref,' +
      'encounterProviders:(uuid,display,provider:(uuid,display)),orders:full,' +
      'obs:(uuid,obsDatetime,formFieldNamespace,formFieldPath,concept:(uuid,uuid,name:(display)),value:ref,groupMembers),' +
      'diagnoses:(uuid,diagnosis,certainty,rank,voided,display))';
    const params = new HttpParams().set('v', customDefaultRep);
    const url = this.getUrl() + 'encounter/' + uuid;
    return this.http.get<Encounter>(url, { params });
  }

  public getEncounterTypes(v: string) {
    if (!v) {
      return null;
    }
    const url = this.getUrl() + 'encountertype';
    return this.http.get(url).pipe(
      map((response: any) => {
        return response.results;
      }),
    );
  }

  public saveEncounter(payload): Observable<Encounter> {
    if (!payload) {
      return null;
    }
    const url = this.getUrl() + 'encounter';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Encounter>(url, JSON.stringify(payload), { headers });
  }

  public updateEncounter(uuid, payload): Observable<Encounter> {
    if (!payload || !uuid) {
      return null;
    }
    const url = this.getUrl() + 'encounter/' + uuid;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Encounter>(url, JSON.stringify(payload), { headers });
  }

  public voidEncounter(uuid): Observable<any> {
    if (!uuid) {
      return null;
    }
    const url = this.getUrl() + 'encounter/' + uuid + '?!purge';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete(url, { headers });
  }
}
