import { TestBed, waitForAsync } from '@angular/core/testing';
import { LocationResourceService } from './location-resource.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OpenmrsApiModule } from './openmrs-api.module';
import { WindowRef } from '../window-ref';

describe('LocationResourceService:', () => {
  let service: LocationResourceService;
  let httpMock: HttpTestingController;
  let windowRef: WindowRef;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [OpenmrsApiModule],
      declarations: [],
      providers: [provideHttpClient(), provideHttpClientTesting(), WindowRef],
    });

    service = TestBed.inject(LocationResourceService);
    httpMock = TestBed.inject(HttpTestingController);
    windowRef = TestBed.inject(WindowRef);
  }));

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should inject service', () => {
    expect(service).toBeDefined();
  });

  it('should return a location when the correct uuid is provided', (done) => {
    const locationUuid = 'xxx-xxx-xxx-xxx';
    const result = {
      uuid: 'xxx-xxx-xxx-xxx',
      display: 'location',
    };

    service.getLocationByUuid(locationUuid).subscribe((location) => {
      expect(location.uuid).toBe('xxx-xxx-xxx-xxx');
      done();
    });

    const req = httpMock.expectOne(service.getLocationByUuidUrl(locationUuid));
    expect(req.request.method).toBe('GET');
    req.flush(result);
  });

  it('should return a list of locations matching search string provided', (done) => {
    const searchText = 'test';
    const results = {
      results: [
        {
          uuid: 'uuid',
          display: 'test',
        },
        {
          uuid: 'uuid2',
          display: 'test location',
        },
      ],
    };
    service.searchLocation(searchText).subscribe((locations) => {
      expect(locations.length).toBe(2);
      done();
    });

    const req = httpMock.expectOne(service.getUrl(searchText));
    expect(req.request.method).toBe('GET');
    req.flush(results);
  });
});
