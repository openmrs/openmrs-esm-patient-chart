import { TestBed, fakeAsync, inject, tick, waitForAsync } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { FormDataSourceService } from './form-data-source.service';
import { ProviderResourceService } from '../openmrs-api/provider-resource.service';
import { FakeProviderResourceService } from '../openmrs-api/provider-resource.service.mock';
import { LocationResourceService } from '../openmrs-api/location-resource.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OpenmrsApiModule } from '../openmrs-api/openmrs-api.module';

describe('Service: FormDataSourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OpenmrsApiModule, HttpClientTestingModule],
      providers: [
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
    const service: FormDataSourceService = TestBed.get(FormDataSourceService);
    expect(service).toBeTruthy();
  });

  it('should find for provider by search text', (done) => {
    const service: FormDataSourceService = TestBed.get(FormDataSourceService);
    const result = service.findProvider('text');

    result.subscribe((results) => {
      expect(results).toBeTruthy();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].value).toEqual('uuid');
      done();
    });
  });

  it(
    'should find provider when getProviderByProviderUuid is called' + ' with a provider uuid',
    inject(
      [ProviderResourceService],
      fakeAsync((providerResourceService: ProviderResourceService) => {
        const service: FormDataSourceService = TestBed.get(FormDataSourceService);
        const uuid = 'provider-uuid-1';
        spyOn(providerResourceService, 'getProviderByUuid').and.callFake((params) => {
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
    ),
  );

  xit('should find location by search text', (done) => {
    const service: FormDataSourceService = TestBed.get(FormDataSourceService);
    const result = service.findLocation('test');

    result.subscribe((results) => {
      expect(results).toBeTruthy();
      done();
    });
  });

  it('should get location by location uuid', inject(
    [LocationResourceService],
    fakeAsync((locationResourceService: LocationResourceService) => {
      const service: FormDataSourceService = TestBed.get(FormDataSourceService);
      const uuid = 'location-uuid-1';
      spyOn(locationResourceService, 'getLocationByUuid').and.callFake((params) => {
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

  it('should find location by uuid', waitForAsync((done) => {
    const service: FormDataSourceService = TestBed.get(FormDataSourceService);
    const result = service.getLocationByUuid('test');

    result.subscribe((results) => {
      expect(results).toBeTruthy();
      done();
    });
  }));

  it('should call resolveConcept', waitForAsync((done) => {
    const service: FormDataSourceService = TestBed.get(FormDataSourceService);
    const result = service.resolveConcept('test');

    result.subscribe((results) => {
      expect(results).toBeTruthy();
      done();
    });
  }));
});
