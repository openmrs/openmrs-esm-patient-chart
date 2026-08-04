import { TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';

import { FormDataSourceService } from './form-data-source.service';
import { ConceptResourceService } from '../openmrs-api/concept-resource.service';
import { ProviderResourceService } from '../openmrs-api/provider-resource.service';
import { FakeProviderResourceService } from '../openmrs-api/provider-resource.service.mock';
import { LocationResourceService } from '../openmrs-api/location-resource.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { OpenmrsApiModule } from '../openmrs-api/openmrs-api.module';

describe('Service: FormDataSourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OpenmrsApiModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LocalStorageService,
        FormDataSourceService,
        {
          provide: ProviderResourceService,
          useFactory: () => {
            return new FakeProviderResourceService(null, null, null);
          },
          deps: [],
        },
      ],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create an instance', () => {
    const service: FormDataSourceService = TestBed.inject(FormDataSourceService);
    expect(service).toBeTruthy();
  });

  it('should find providers by search text after 300ms delay', fakeAsync(() => {
    const service: FormDataSourceService = TestBed.inject(FormDataSourceService);
    let actualResults: any[];

    service.findProvider('text').subscribe((results) => {
      actualResults = results;
    });

    tick(300); // advance past the timer delay

    expect(actualResults).toBeTruthy();
    expect(actualResults.length).toBeGreaterThan(0);
    expect(actualResults[0].value).toEqual('uuid');
  }));

  it('should return empty array for empty or whitespace search text', (done) => {
    const service: FormDataSourceService = TestBed.inject(FormDataSourceService);

    service.findProvider('').subscribe((results) => {
      expect(results).toEqual([]);
      done();
    });
  });

  it('should return independent observables for each search', fakeAsync(() => {
    const service: FormDataSourceService = TestBed.inject(FormDataSourceService);
    const providerResourceService = TestBed.inject(ProviderResourceService);
    const searchSpy = spyOn(providerResourceService, 'searchProvider').and.callThrough();

    let firstResults: any[];
    let secondResults: any[];

    // Two independent searches - each gets its own observable
    service.findProvider('first').subscribe((results) => {
      firstResults = results;
    });

    service.findProvider('second').subscribe((results) => {
      secondResults = results;
    });

    tick(300);

    // Each call triggers its own API request (isolation maintained)
    expect(searchSpy).toHaveBeenCalledTimes(2);
    expect(searchSpy).toHaveBeenCalledWith('first');
    expect(searchSpy).toHaveBeenCalledWith('second');

    // Both should have results
    expect(firstResults).toBeTruthy();
    expect(secondResults).toBeTruthy();
  }));

  it('should find provider when getProviderByProviderUuid is called with a provider uuid', inject(
    [ProviderResourceService],
    fakeAsync((providerResourceService: ProviderResourceService) => {
      const service: FormDataSourceService = TestBed.inject(FormDataSourceService);
      const uuid = 'provider-uuid-1';
      spyOn(providerResourceService, 'getProviderByUuid').and.callFake((_params: string) => {
        const subject = new BehaviorSubject<any>({});
        subject.next({
          uuid: 'uuid',
          display: 'display',
        });
        return subject;
      });
      //
      service.getProviderByUuid(uuid).subscribe((data) => {
        expect(data).toBeTruthy();
        tick(50);
      });
      expect(providerResourceService.getProviderByUuid).toHaveBeenCalled();
    }),
  ));

  xit('should find location by search text', (done) => {
    const service: FormDataSourceService = TestBed.inject(FormDataSourceService);
    const result = service.findLocation('test');

    result.subscribe((results) => {
      expect(results).toBeTruthy();
      done();
    });
  });

  it('should get location by location uuid', inject(
    [LocationResourceService],
    fakeAsync((locationResourceService: LocationResourceService) => {
      const service: FormDataSourceService = TestBed.inject(FormDataSourceService);
      const uuid = 'location-uuid-1';
      spyOn(locationResourceService, 'getLocationByUuid').and.callFake((_params: string) => {
        const subject = new BehaviorSubject<any>({});
        subject.next({
          uuid: 'uuid',
          display: 'display',
        });
        return subject;
      });
      service.getLocationByUuid(uuid);
      tick(50);
      expect(locationResourceService.getLocationByUuid).toHaveBeenCalled();
    }),
  ));

  // TODO: These tests need proper HTTP mocking to work correctly
  xit('should find location by uuid', fakeAsync(() => {
    const service: FormDataSourceService = TestBed.inject(FormDataSourceService);
    let resultData: any;

    service.getLocationByUuid('test').subscribe((results) => {
      resultData = results;
    });

    tick(100);
    expect(resultData).toBeTruthy();
  }));

  // TODO: This test needs proper HTTP mocking to work correctly
  xit('should call resolveConcept', fakeAsync(() => {
    const service: FormDataSourceService = TestBed.inject(FormDataSourceService);
    let resultData: any;

    service.resolveConcept('test').subscribe((results) => {
      resultData = results;
    });

    tick(100);
    expect(resultData).toBeTruthy();
  }));

  describe('diagnosis concept codes', () => {
    const diagnosisClassUuid = '8d4918b0-c2cc-11de-8d13-0010c6dffd0f';
    const icd11SourceUuid = '43aaca5f-d623-43fd-993b-673b5d927cdd';
    const sameAsMapTypeUuid = '35543629-7d8c-11e1-909d-c80aa9edcf4e';

    const choleraConcept = {
      uuid: 'cholera-uuid',
      name: { display: 'Cholera' },
      conceptClass: { uuid: diagnosisClassUuid },
      mappings: [
        {
          conceptMapType: { uuid: 'narrower-than-uuid', display: 'NARROWER-THAN' },
          conceptReferenceTerm: { code: '1A0Z', conceptSource: { uuid: icd11SourceUuid } },
        },
        {
          conceptMapType: { uuid: sameAsMapTypeUuid, display: 'SAME-AS' },
          conceptReferenceTerm: { code: '1A00', conceptSource: { uuid: icd11SourceUuid } },
        },
        {
          conceptMapType: { uuid: sameAsMapTypeUuid, display: 'SAME-AS' },
          conceptReferenceTerm: { code: 'A00', conceptSource: { uuid: 'icd10-source-uuid' } },
        },
      ],
    };

    const unmappedConcept = {
      uuid: 'unmapped-uuid',
      name: { display: 'Typhoid arthritis' },
      conceptClass: { uuid: diagnosisClassUuid },
      mappings: [],
    };

    it('should include the code from the configured concept source, preferring SAME-AS mappings', (done) => {
      const service: FormDataSourceService = TestBed.inject(FormDataSourceService);
      const conceptResourceService = TestBed.inject(ConceptResourceService);
      const searchSpy = spyOn(conceptResourceService, 'searchConcept').and.returnValue(of([choleraConcept]));

      service.findDiagnoses('chol', { conceptSourceUuid: icd11SourceUuid }).subscribe((results) => {
        expect(searchSpy).toHaveBeenCalledWith('chol', false, jasmine.stringContaining('mappings'));
        expect(results).toEqual([{ value: 'cholera-uuid', label: 'Cholera', code: '1A00' }]);
        done();
      });
    });

    it('should fall back to the first mapping to the source when none is SAME-AS', (done) => {
      const service: FormDataSourceService = TestBed.inject(FormDataSourceService);
      const conceptResourceService = TestBed.inject(ConceptResourceService);
      const narrowerOnly = {
        ...choleraConcept,
        mappings: [choleraConcept.mappings[0]],
      };
      spyOn(conceptResourceService, 'searchConcept').and.returnValue(of([narrowerOnly]));

      service.findDiagnoses('chol', { conceptSourceUuid: icd11SourceUuid }).subscribe((results) => {
        expect(results[0].code).toBe('1A0Z');
        done();
      });
    });

    it('should omit the code for concepts without a mapping to the source', (done) => {
      const service: FormDataSourceService = TestBed.inject(FormDataSourceService);
      const conceptResourceService = TestBed.inject(ConceptResourceService);
      spyOn(conceptResourceService, 'searchConcept').and.returnValue(of([unmappedConcept]));

      service.findDiagnoses('typh', { conceptSourceUuid: icd11SourceUuid }).subscribe((results) => {
        expect(results).toEqual([{ value: 'unmapped-uuid', label: 'Typhoid arthritis' }]);
        done();
      });
    });

    it('should not request mappings or emit codes when no concept source is configured', (done) => {
      const service: FormDataSourceService = TestBed.inject(FormDataSourceService);
      const conceptResourceService = TestBed.inject(ConceptResourceService);
      const searchSpy = spyOn(conceptResourceService, 'searchConcept').and.returnValue(of([choleraConcept]));

      service.findDiagnoses('chol').subscribe((results) => {
        expect(searchSpy).toHaveBeenCalledWith('chol', false, null);
        expect(results).toEqual([{ value: 'cholera-uuid', label: 'Cholera' }]);
        done();
      });
    });

    it('should resolve a selected value with its code from the configured source', (done) => {
      const service: FormDataSourceService = TestBed.inject(FormDataSourceService);
      const conceptResourceService = TestBed.inject(ConceptResourceService);
      const getSpy = spyOn(conceptResourceService, 'getConceptByUuid').and.returnValue(of(choleraConcept));

      service.resolveConcept('cholera-uuid', { conceptSourceUuid: icd11SourceUuid }).subscribe((result) => {
        expect(getSpy).toHaveBeenCalledWith('cholera-uuid', false, jasmine.stringContaining('mappings'));
        expect(result).toEqual({ value: 'cholera-uuid', label: 'Cholera', code: '1A00' });
        done();
      });
    });

    it('should stay safe when mapConcept is used as an unbound Array.map callback', () => {
      const service: FormDataSourceService = TestBed.inject(FormDataSourceService);
      // The cast mirrors the service's own untyped `.map(this.mapConcept)` call
      // sites; at runtime the callback still receives (value, index, array) and
      // no `this` context.
      const mapped = [choleraConcept, unmappedConcept].map(service.mapConcept as (concept: any) => any);
      expect(mapped).toEqual([
        { value: 'cholera-uuid', label: 'Cholera' },
        { value: 'unmapped-uuid', label: 'Typhoid arthritis' },
      ]);
    });
  });
});
