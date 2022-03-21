import { Injectable } from '@angular/core';
import { HttpParams, HttpClient } from '@angular/common/http';

import { Observable, ReplaySubject, of } from 'rxjs';
import { take, map, catchError } from 'rxjs/operators';

import { PersonResourceService } from './person-resource.service';
import { WindowRef } from '../window-ref';
import { Provider, ListResult } from '../types';

@Injectable()
export class ProviderResourceService {
  private static readonly v = 'custom:(uuid,display,person:(uuid))';

  constructor(
    protected http: HttpClient,
    private windowRef: WindowRef,
    protected personService: PersonResourceService,
  ) {}

  public searchProvider(searchText: string): Observable<Array<Provider>> {
    return this.getAllProviders().pipe(
      map((providers) =>
        providers.filter((provider) => provider.display.toLowerCase().includes(searchText.toLowerCase())),
      ),
    );
  }

  public getProviderByUuid(uuid: string): Observable<Provider | undefined> {
    const url = this.windowRef.openmrsRestBase + 'provider/' + uuid + '?v=' + ProviderResourceService.v;
    return this.http.get<Provider>(url).pipe(catchError(() => this.getProviderByUuidFallback(uuid)));
  }

  private getProviderByUuidFallback(uuid: string): Observable<Provider | undefined> {
    return this.getAllProviders().pipe(map((providers) => providers.find((provider) => provider.uuid === uuid)));
  }

  private getAllProviders(): Observable<Array<Provider>> {
    const url = this.windowRef.openmrsRestBase + 'provider?q=&v=' + ProviderResourceService.v;
    return this.http.get<ListResult<Provider>>(url).pipe(map((r) => r.results));
  }

  public getUrl(uuid?: string) {
    return uuid
      ? this.windowRef.openmrsRestBase + 'provider/' + uuid + '?v=' + ProviderResourceService.v
      : this.windowRef.openmrsRestBase + 'provider?q=&v=' + ProviderResourceService.v;
  }
}
