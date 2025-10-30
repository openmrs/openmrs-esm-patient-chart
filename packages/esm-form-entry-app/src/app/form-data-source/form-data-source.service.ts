import { Injectable } from '@angular/core';

import { take, map, tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { FetchResponse, fhirBaseUrl, FHIRResource, openmrsFetch } from '@openmrs/esm-framework';

import { ProviderResourceService } from '../openmrs-api/provider-resource.service';
import { LocationResourceService } from '../openmrs-api/location-resource.service';
import { ConceptResourceService } from '../openmrs-api/concept-resource.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import type {
  Concept,
  FormSchema,
  Identifier,
  Location,
  Observation,
  PatientModel,
  Provider,
  Questions,
} from '../types';
import { AppointmentService } from '../openmrs-api/appointment-resource.service';
import { capitalize } from 'lodash';

@Injectable()
export class FormDataSourceService {
  constructor(
    private providerResourceService: ProviderResourceService,
    private locationResourceService: LocationResourceService,
    private conceptResourceService: ConceptResourceService,
    private localStorageService: LocalStorageService,
    private appointmentService: AppointmentService,
  ) {}

  public getDataSources(formSchema: FormSchema) {
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
      diagnoses: {
        resolveSelectedValue: this.resolveConcept.bind(this),
        searchOptions: this.findDiagnoses.bind(this),
      },
      services: {
        resolveSelectedValue: this.resolveAppointmentService.bind(this),
        searchOptions: this.findAppointmentServices.bind(this),
      },
      conceptAnswers: this.getWhoStagingCriteriaDataSource(),
      recentObs: this.getMostRecentObsDataSource(formSchema),
    };
  }

  private resolveAppointmentService(uuid: string) {
    return this.appointmentService.fetchAppointmentServiceByUuid(uuid);
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

  private getMostRecentObsDataSource(formSchema: FormSchema) {
    const conceptIdentifiers: Set<string> = new Set();
    for (const page of formSchema.pages) {
      for (const section of page.sections) {
        this.extractMostRecentObsConceptIds(section.questions, conceptIdentifiers);
      }
    }

    return (patient: string) => {
      return this.fetchMostRecentObsValue(patient, [...conceptIdentifiers]);
    };
  }

  public extractMostRecentObsConceptIds(questions: Array<Questions>, concepts: Set<string>) {
    for (const question of questions) {
      const conceptsForExpressionEvaluation = question.questionOptions?.conceptsForExpressionEvaluation;
      if (Array.isArray(conceptsForExpressionEvaluation)) {
        conceptsForExpressionEvaluation.forEach((concept) => concepts.add(concept));
      }
      const useMostRecentValue = question.questionOptions?.useMostRecentValue ?? false;
      if (useMostRecentValue === 'true' || (typeof useMostRecentValue === 'boolean' && useMostRecentValue)) {
        if (typeof question.concept === 'string') {
          concepts.add(question.concept);
          continue;
        }

        if (typeof question.questionOptions?.concept === 'string') {
          concepts.add(question.questionOptions.concept);
          continue;
        }

        if (Array.isArray(question.questions)) {
          this.extractMostRecentObsConceptIds(question.questions, concepts);
        }
      }
    }
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

  public findLocation(searchText: string, dataSourceOptions?) {
    const locationTag = dataSourceOptions?.tag;
    const searchTerm = searchText;

    if (locationTag) {
      return this.locationResourceService.fetchFhirLocationsByTagAndName(locationTag, searchTerm).pipe(
        map((locations) => locations.map(this.mapLocation)),
        take(10),
      );
    }

    return this.locationResourceService.searchLocation(searchText).pipe(
      map((locations) => locations.map(this.mapLocation)),
      take(10),
    );
  }

  private fetchMostRecentObsValue(patient: string, concepts: string | Array<string>) {
    if (!patient) {
      throw new Error('patient must be provided in call to fetchMostRecentObsValue');
    }

    if (!concepts) {
      throw new Error('at least one concept must be provided in call to fetchMostRecentObsValue');
    }

    if (typeof concepts === 'string') {
      concepts = [concepts];
    }

    if (!Array.isArray(concepts)) {
      throw new Error(
        `concepts must be supplied to fetchMostRecentObsValue as either a string or array or strings. Instead, we got ${JSON.stringify(
          concepts,
        )}`,
      );
    }

    const urlParams = new URLSearchParams({
      patient,
      code: concepts.join(','),
      max: '1',
      _summary: 'data',
    });

    return openmrsFetch<{ entry: Array<FHIRResource> }>(
      `${fhirBaseUrl}/Observation/$lastn?${urlParams.toString()}`,
    ).then((response: FetchResponse<{ entry: Array<FHIRResource> }>) =>
      response.ok
        ? // The extracted observations are formatted to match the OpenMRS REST Encounter format
          // This allows them to be consumed by the historical data source
          this.extractObservationValue(response)
        : { obs: [] },
    );
  }

  public getLocationByUuid(uuid: string) {
    return this.locationResourceService.getLocationByUuid(uuid).pipe(map(this.mapLocation));
  }

  public getAppointmentServices(searchText: string) {
    return this.appointmentService.fetchAllAppointmentServices().pipe(map((services) => this.mapService(services)));
  }

  public mapService(service) {
    return {
      label: service.name,
      value: service.uuid,
    };
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
  public findDiagnoses(searchText?: string, dataSourceOptions: Record<string, any> = {}) {
    const conceptSourceUuids: Array<string> = dataSourceOptions?.conceptSourceUuid;
    const allowedConceptClasses = ['8d4918b0-c2cc-11de-8d13-0010c6dffd0f'];
    const customRepresentation = conceptSourceUuids
      ? 'custom:(uuid,name:(uuid,display),conceptClass:(uuid,display),setMembers,mappings:(conceptReferenceTerm:(code,name,display,conceptSource:(uuid))))'
      : null;

    return this.conceptResourceService.searchConcept(searchText, false, customRepresentation).pipe(
      map((concepts) => {
        return concepts
          .filter((concept) => concept.conceptClass && allowedConceptClasses.includes(concept.conceptClass.uuid))
          .filter((concept) => this.filterConceptByConceptSourceUuid(concept, conceptSourceUuids))
          .map((concept) => this.mapConceptWithMappings(concept, conceptSourceUuids));
      }),
    );
  }

  private filterConceptByConceptSourceUuid(concept, conceptSourceUuids: Array<string>) {
    if (!conceptSourceUuids || conceptSourceUuids.length === 0) {
      return true;
    }
    return concept.mappings.find((mapping) =>
      conceptSourceUuids.includes(mapping.conceptReferenceTerm.conceptSource.uuid),
    );
  }

  public findAppointmentServices(searchText: string) {
    return this.appointmentService
      .fetchAllAppointmentServices(searchText)
      .pipe(map((services) => services.map(this.mapService)));
  }

  public mapConceptWithMappings(concept: Concept, conceptSourceUuid: Array<string>) {
    if (!conceptSourceUuid) {
      return {
        value: concept.uuid,
        label: concept.name.display,
      };
    }

    const conceptMappings = conceptSourceUuid
      ? concept?.mappings?.filter((mapping) =>
          conceptSourceUuid.includes(mapping.conceptReferenceTerm.conceptSource.uuid),
        )
      : null;

    const referenceName = conceptMappings?.map((mapping) => mapping.conceptReferenceTerm.code).join(' , ');
    const label = referenceName ? `${referenceName} - ${capitalize(concept.name.display)}` : concept.name.display;

    return {
      value: concept.uuid,
      label: label,
    };
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
  private getGender(gender): string {
    switch (gender) {
      case 'male':
        return 'M';
      case 'female':
        return 'F';
      case 'other':
        return 'O';
      case 'unknown':
        return 'U';
      default:
        return 'U';
    }
  }
  public getPatientObject(patient): PatientModel {
    return {
      ...patient,
      patientUuid: patient.id,
      sex: this.getGender(patient.gender),
      birthdate: patient.birthDate ? new Date(patient.birthDate) : undefined,
      age: this.calculateAge(patient.birthDate),
      gendercreatconstant: patient.gender === 'female' ? 0.85 : patient.gender === 'male' ? 1 : undefined,
      identifiers: this.mapFHIRPatientIdentifiersToOpenMRSIdentifiers(patient),
    };
  }

  private calculateAge(birthday) {
    const ageDifMs = Date.now() - new Date(birthday).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  private mapFHIRPatientIdentifiersToOpenMRSIdentifiers(patient): Array<Identifier> {
    const identifiers = patient?.identifier ?? [];

    return identifiers?.map((patientIdentifier) => ({
      uuid: patientIdentifier?.id,
      identifierType: {
        uuid: patientIdentifier?.type?.coding?.[0]?.code,
        display: patientIdentifier?.type?.text,
      },
      identifier: patientIdentifier?.value,
      location: {
        uuid: this.extractLocationUuid(patientIdentifier?.extension?.[0]?.valueReference?.reference),
        display: patientIdentifier?.extension?.[0]?.valueReference?.display,
      },
    }));
  }

  private extractLocationUuid(locationReference: string): string | null {
    const lastIndexOf = locationReference?.lastIndexOf('/');
    if (lastIndexOf !== -1) {
      return locationReference?.substring(lastIndexOf + 1);
    }
    return '';
  }

  private extractObservationValue(resource: FetchResponse<{ entry: Array<FHIRResource> }>): {
    obs: Array<Partial<Observation>>;
  } {
    const observations: Array<Partial<Observation>> = [];

    if (!resource.data.entry) {
      return { obs: [] };
    }

    for (const entry of resource.data.entry) {
      if (entry.resource?.resourceType !== 'Observation' || !entry.resource.code) {
        continue;
      }

      const code = entry.resource.code.coding.find((c) => !c.system)?.code;
      if (!code) {
        continue;
      }

      const valueString = entry.resource?.valueString;
      const valueQuantity = entry.resource?.valueQuantity?.value;
      const valueCoding = entry.resource?.valueCodeableConcept?.coding?.find((c: any) => !c.system)?.code;
      const valueDateTime = entry.resource?.['valueDateTime']; // TODO: Add valueDateTime to FHIRResource type
      const value = valueString ?? valueQuantity ?? valueCoding ?? valueDateTime;

      if (!value) {
        continue;
      }

      observations.push({
        concept: { uuid: code, display: null, conceptClass: null },
        value,
      });
    }

    return { obs: observations };
  }
}
