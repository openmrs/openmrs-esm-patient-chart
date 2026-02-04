import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { WindowRef } from '../window-ref';

@Injectable()
export class ConceptResourceService {
  public v = 'custom:(uuid,name,conceptClass,setMembers)';

  constructor(
    protected http: HttpClient,
    protected windowRef: WindowRef,
  ) {}

  public getUrl(): string {
    return this.windowRef.openmrsRestBase + 'concept';
  }

  public searchConcept(searchText: string, cached: boolean = false, v: string = null): Observable<any> {
    const url = this.getUrl();
    const params: HttpParams = new HttpParams().set('q', searchText).set('v', v && v.length > 0 ? v : this.v);

    return this.http
      .get<any>(url, {
        params,
      })
      .pipe(
        map((response) => {
          return response.results;
        }),
      );
  }

  public getConceptByUuid(uuid: string, cached: boolean = false, v: string = this.v): Observable<any> {
    let url = this.getUrl();
    url += '/' + uuid;
    const params: HttpParams = new HttpParams().set('v', v && v.length > 0 ? v : this.v);
    return this.http.get(url, {
      params,
    });
  }
  public getConceptByConceptClassesUuid(searchText, conceptClassesUuidArray) {
    let filteredConceptResults = [];
    const response = this.searchConcept(searchText);
    response.pipe(take(1)).subscribe(
      (concepts) => {
        filteredConceptResults = this.filterResultsByConceptClassesUuid(concepts, conceptClassesUuidArray);
      },
      (error) => {},
    );
    return filteredConceptResults;
  }
  public filterResultsByConceptClassesUuid(results, conceptClassesUuidArray) {
    const res = results.filter((result: any) => {
      return conceptClassesUuidArray.find((uuid) => {
        return result.conceptClass.uuid === uuid;
      });
    });
    return res;
  }

  public getConceptByClassUuid(conceptClassUuid: string, searchText) {
    const params = `?searchType=fuzzy&class=${conceptClassUuid}&name=${searchText}&v=full&limit=1`;
    const url = `${this.getUrl()}${params}`;
    return this.http.get(url).pipe(
      map((response: any) => {
        return response.results;
      }),
    );
  }
}
