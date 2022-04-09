import { TestBed, inject, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { LocationResourceService } from './location-resource.service';
import { HttpTestingController, HttpClientTestingModule, TestRequest } from '@angular/common/http/testing';
import { OpenmrsApiModule } from './openmrs-api.module';
import { WindowRef } from '../window-ref';

describe('LocationResourceService:', () => {
  let service: LocationResourceService;
  let httpMock: HttpTestingController;
  let windowRef: WindowRef;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [OpenmrsApiModule, HttpClientTestingModule],
      declarations: [],
      providers: [WindowRef],
    });

    service = TestBed.get(LocationResourceService);
    httpMock = TestBed.get(HttpTestingController);
    windowRef = TestBed.get(WindowRef);
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
    const results = [
      {
        uuid: 'xxx-xxx-xxx-xxx',
        display: 'location',
      },
    ];

    let req: TestRequest;
    service.getLocationByUuid(locationUuid).subscribe((result) => {
      expect(results[0].uuid).toBe('xxx-xxx-xxx-xxx');
      expect(req.request.method).toBe('GET');
      done();
    });

    // stubbing
    req = httpMock.expectOne(service.getUrl(locationUuid));
    req.flush(results);
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
          uuid: 'uuid',
          display: 'other',
        },
      ],
    };
    service.searchLocation(searchText).subscribe((locations) => {
      for (const location of locations) {
        expect(location.display).toContain(searchText);
      }
      done();
    });

    const req = httpMock.expectOne(service.getUrl());
    req.flush(results);
  });
});
