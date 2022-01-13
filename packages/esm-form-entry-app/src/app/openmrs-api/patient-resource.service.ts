import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

import { WindowRef } from '../window-ref';

// TODO inject service

@Injectable()
export class PatientResourceService {
  public v: string =
    'custom:(uuid,display,' +
    'identifiers:(identifier,uuid,preferred,location:(uuid,name),' +
    'identifierType:(uuid,name,format,formatDescription,validator)),' +
    'person:(uuid,display,gender,birthdate,dead,age,deathDate,birthdateEstimated,' +
    'causeOfDeath,preferredName:(uuid,preferred,givenName,middleName,familyName),' +
    'attributes:(uuid,display,value,attributeType,dateCreated,dateChanged),preferredAddress:(uuid,preferred,address1,address2,cityVillage,longitude,' +
    'stateProvince,latitude,country,postalCode,countyDistrict,address3,address4,address5' +
    ',address6,address7)))';

  constructor(protected http: HttpClient, private windowRef: WindowRef) {}

  public getUrl(): string {
    return this.windowRef.openmrsRestBase + 'patient';
  }

  public searchPatient(searchText: string, cached: boolean = false, v: string = null): Observable<any> {
    const url = this.getUrl();
    const params: HttpParams = new HttpParams()
      .set('q', searchText)
      .set('includeDead', 'true')
      .set('v', v && v.length > 0 ? v : this.v);
    return this.http
      .get(url, {
        params: params,
      })
      .pipe(
        map((response: any) => {
          return response.results;
        }),
      );
  }

  public getPatientByUuid(uuid: string, cached: boolean = false, v: string = null): Observable<any> {
    let url = this.getUrl();
    url += '/' + uuid;

    const params: HttpParams = new HttpParams().set('v', v && v.length > 0 ? v : this.v);

    return this.http.get(url, {
      params: params,
    });
  }
  public saveUpdatePatientIdentifier(uuid, identifierUuid, payload): Observable<any> {
    if (!payload || !uuid) {
      return null;
    }
    const url = this.getUrl() + '/' + uuid + '/' + 'identifier' + '/' + identifierUuid;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, JSON.stringify(payload), { headers }).pipe(
      map((response: any) => {
        return response.patient;
      }),
    );
  }
}
