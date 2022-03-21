import { Injectable } from '@angular/core';

import { take, map, tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { age } from '@openmrs/esm-framework';

import { ProviderResourceService } from '../openmrs-api/provider-resource.service';
import { LocationResourceService } from '../openmrs-api/location-resource.service';
import { ConceptResourceService } from '../openmrs-api/concept-resource.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { Concept, Location, Provider } from '../types';

@Injectable()
export class FormDataSourceService {
  constructor(
    private providerResourceService: ProviderResourceService,
    private locationResourceService: LocationResourceService,
    private conceptResourceService: ConceptResourceService,
    private localStorageService: LocalStorageService,
  ) {}

  public getDataSources() {
    return {
      location: {
        resolveSelectedValue: this.getLocationByUuid.bind(this),
        searchOptions: this.findLocation.bind(this),
      },
      provider: {
        resolveSelectedValue: this.getProviderByUuid.bind(this),
        searchOptions: this.findProvider.bind(this),
      },
      drug: {
        resolveSelectedValue: this.resolveConcept.bind(this),
        searchOptions: this.findDrug.bind(this),
      },
      problem: {
        resolveSelectedValue: this.resolveConcept.bind(this),
        searchOptions: this.findProblem.bind(this),
      },
      conceptAnswers: this.getWhoStagingCriteriaDataSource(),
    };
  }

  private getWhoStagingCriteriaDataSource() {
    const sourceChangedSubject = new Subject();

    const datasource = {
      cachedOptions: [],
      dataSourceOptions: {
        concept: undefined,
      },
      resolveSelectedValue: undefined,
      searchOptions: undefined,
      dataFromSourceChanged: sourceChangedSubject.asObservable(),
      changeConcept: undefined,
    };

    const find = (uuid: string) => {
      if (datasource.cachedOptions.length > 0) {
        return Observable.create((observer: Subject<any>) => {
          observer.next(datasource.cachedOptions);
        });
      }
      const valuesObservable = this.getConceptSetMembers(datasource.dataSourceOptions.concept);
      valuesObservable.subscribe((results) => {
        datasource.cachedOptions = results;
      });
      return valuesObservable;
    };
    const resolve = (uuid: string) => {
      return this.resolveConcept(uuid);
    };

    const changeConcept = (uuid: string) => {
      datasource.dataSourceOptions.concept = uuid;
      datasource.cachedOptions = [];
      sourceChangedSubject.next([]);
      find(uuid).subscribe((results) => {
        sourceChangedSubject.next(results);
      });
    };

    datasource.resolveSelectedValue = resolve;
    datasource.searchOptions = find;
    datasource.changeConcept = changeConcept;

    return datasource;
  }

  public findProvider(searchText): Observable<any[]> {
    return this.providerResourceService.searchProvider(searchText).pipe(
      map((providers) => providers.filter((p) => !!p.person).map(this.mapProvider)),
      tap((result) => this.setCachedProviderSearchResults(result)),
    );
  }

  public getProviderByUuid(uuid: string): Observable<any> {
    return this.providerResourceService.getProviderByUuid(uuid).pipe(map(this.mapProvider));
  }

  private mapProvider(provider?: Provider) {
    return (
      provider && {
        label: provider.display,
        value: provider.uuid,
        providerUuid: provider.uuid,
      }
    );
  }

  public findLocation(searchText) {
    return this.locationResourceService.searchLocation(searchText).pipe(
      map((locations) => locations.map(this.mapLocation)),
      take(10),
    );
  }

  public getLocationByUuid(uuid: string) {
    return this.locationResourceService.getLocationByUuid(uuid).pipe(map(this.mapLocation));
  }

  private mapLocation(location?: Location) {
    return (
      location && {
        label: location.display,
        value: location.uuid,
      }
    );
  }

  public resolveConcept(uuid: string) {
    return this.conceptResourceService.getConceptByUuid(uuid).pipe(map(this.mapConcept));
  }

  public getConceptAnswers(uuid: string) {
    return this.conceptResourceService
      .getConceptByUuid(uuid)
      .pipe(map((concept) => concept.answers.map(this.mapConcept)));
  }

  public getConceptSetMembers(uuid: string) {
    return this.conceptResourceService
      .getConceptByUuid(uuid)
      .pipe(map((concept) => concept.setMembers.map(this.mapConcept).sort((a, b) => (a.label > b.label ? 1 : 0))));
  }

  public findDrug(searchText) {
    const drugClass = '8d490dfc-c2cc-11de-8d13-0010c6dffd0f';
    return this.conceptResourceService
      .searchConcept(searchText)
      .pipe(
        map((concepts) =>
          concepts
            .filter((concept) => concept.conceptClass && concept.conceptClass.uuid === drugClass)
            .map(this.mapConcept),
        ),
      );
  }

  public findProblem(searchText) {
    const allowedConceptClasses = [
      '8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
      '8d492b2a-c2cc-11de-8d13-0010c6dffd0f',
      '8d492954-c2cc-11de-8d13-0010c6dffd0f',
      '8d491a9a-c2cc-11de-8d13-0010c6dffd0f',
    ];

    return this.conceptResourceService
      .searchConcept(searchText)
      .pipe(
        map((concepts) =>
          concepts
            .filter((concept) => concept.conceptClass && allowedConceptClasses.includes(concept.conceptClass.uuid))
            .map(this.mapConcept),
        ),
      );
  }

  public mapConcept(concept?: Concept) {
    return (
      concept && {
        value: concept.uuid,
        label: concept.name.display,
      }
    );
  }

  public getCachedProviderSearchResults() {
    const sourcekey = 'cachedproviders';
    return this.localStorageService.getObject<Array<object>>(sourcekey);
  }

  private setCachedProviderSearchResults(searchProviderResults): void {
    const sourcekey = 'cachedproviders';
    this.localStorageService.setObject(sourcekey, searchProviderResults);
  }

  public getPatientObject(patient): object {
    const model: object = {};
    model['sex'] = patient?.gender === 'male' ? 'M' : 'F';
    model['birthdate'] = new Date(patient?.birthDate);
    model['age'] = parseInt(age(patient?.birthDate).match(/\d+/g).join(''));

    // define gender based constant:
    if (patient?.gender === 'female') {
      model['gendercreatconstant'] = 0.85;
    }
    if (patient?.gender === 'male') {
      model['gendercreatconstant'] = 1;
    }

    return model;
  }
}
