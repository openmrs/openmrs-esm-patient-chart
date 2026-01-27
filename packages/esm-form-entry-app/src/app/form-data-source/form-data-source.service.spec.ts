import { TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { FormDataSourceService } from './form-data-source.service';
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
});
