import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

import { WindowRef } from '../window-ref';
import { Form, PatientIdentifierAdapter } from '@openmrs/ngx-formentry';
import { SingleSpaPropsService } from '../single-spa-props/single-spa-props.service';
import { FormDataSourceService } from '../form-data-source/form-data-source.service';
import { OpenmrsResource } from '@openmrs/esm-framework';
import { IdentifierPayload } from '../types';

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

  constructor(
    protected http: HttpClient,
    private windowRef: WindowRef,
    private readonly patientIdentifierAdapter: PatientIdentifierAdapter,
    private readonly singleSpaPropsService: SingleSpaPropsService,
    private readonly formDataSourceService: FormDataSourceService,
  ) {}

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
  public saveUpdatePatientIdentifier(patientUuid: string, identifierUuid: string, payload): Observable<any> {
    if (!payload || !patientUuid) {
      return null;
    }

    const url = this.getUrl() + '/' + patientUuid + '/' + 'identifier' + '/' + identifierUuid;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, JSON.stringify(payload), { headers });
  }

  public createPatientIdentifier(patientUuid: string, payload): Observable<any> {
    const url = `${this.getUrl()}/${patientUuid}/identifier`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, JSON.stringify(payload), { headers });
  }

  public buildIdentifiersToUpdatePayload(form: Form): Array<any> {
    const location: OpenmrsResource = form.dataSourcesContainer.dataSources['userLocation'];
    const patientIdentifiers = this.patientIdentifierAdapter.generateFormPayload(form, location?.uuid);

    const currentIdentifiers = this.retrieveCurrentPatientIdentifiers();

    const identifiersToUpdate = currentIdentifiers
      .filter(({ identifierType }) =>
        patientIdentifiers.find((pIdentifier) => pIdentifier.identifierType === identifierType.uuid),
      )
      .map((identifier) => {
        const updatedIdentifier = patientIdentifiers.find(
          (pIdentifier) => pIdentifier.identifierType === identifier.identifierType.uuid,
        );
        return {
          ...identifier,
          location: {
            uuid: location.uuid,
            display: location.display,
          },
          identifier: updatedIdentifier.identifier,
        };
      });

    return identifiersToUpdate;
  }

  public retrieveCurrentPatientIdentifiers() {
    const patient = this.singleSpaPropsService.getPropOrThrow('patient');
    const patientObj = this.formDataSourceService.getPatientObject(patient);
    return patientObj?.identifiers;
  }

  public buildIdentifiersToCreatePayload(form: Form) {
    const location: OpenmrsResource = form.dataSourcesContainer.dataSources['userLocation'];
    const currentIdentifiers = this.retrieveCurrentPatientIdentifiers();
    const updatedIdentifiers = this.patientIdentifierAdapter.generateFormPayload(form, location.uuid);

    const newIdentifiers = updatedIdentifiers.filter(
      (updatedIdentifier) =>
        !currentIdentifiers.some(
          (exIdentifier) => exIdentifier.identifierType.uuid === updatedIdentifier.identifierType,
        ),
    );

    return newIdentifiers;
  }

  public buildIdentifierPayload(form): IdentifierPayload {
    const currentIdentifiers = this.buildIdentifiersToUpdatePayload(form);
    const newIdentifiers = this.buildIdentifiersToCreatePayload(form);
    return { newIdentifiers, currentIdentifiers };
  }

  public validateIdentifiers(form: Form) {
    const { newIdentifiers } = this.buildIdentifierPayload(form);
    const patientIdentifierNodes = this.patientIdentifierAdapter.getPatientIdentifierNodes(form.rootNode);
    const nodeValue = patientIdentifierNodes?.[0];

    if (newIdentifiers.length > 0) {
      return this.searchPatient(newIdentifiers[0].identifier);
    }

    if (nodeValue && nodeValue.control.value !== nodeValue.initialValue) {
      return this.searchPatient(nodeValue.control.value);
    }

    return of([]);
  }
}
