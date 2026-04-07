import { TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { PersonResourceService } from './person-resource.service';
import { OpenmrsApiModule } from './openmrs-api.module';

// Load the implementations that should be tested

describe('PersonResourceService', () => {
  let service: PersonResourceService;
  let httpMock: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [OpenmrsApiModule],
      declarations: [],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PersonResourceService);
    httpMock = TestBed.inject(HttpTestingController);
  }));

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  const personUuid = 'uuid';
  const personPayload = {
    age: 21,
    names: [
      {
        // adding new person name
        middleName: 'Tests',
        familyName2: 'Tester',
      },
      {
        // Editing existing person name
        uuid: '0cfcb36e-a92f-4b71-b37e-2eedd24abe31',
        middleName: 'Test',
        familyName2: 'Ampath Tester',
      },
    ],
    attributes: [
      // when creating new or updating, Api handles updates automatically
      {
        attributeType: 'attribute-type-uuid',
        value: 'Test Race',
      },
    ],
    addresses: [
      {
        // creating new person address
        address3: 'Third Address',
        address4: 'Fourth Address',
      },
      {
        // editing an existing person address
        address5: 'Fifth Address',
        address6: 'Sixth Address',
        uuid: 'person-address-uuid', // provide uuid if updating
      },
    ],
  };

  it('should be injected with all dependencies', () => {
    expect(service).toBeDefined();
  });

  it('should return a person when the correct uuid is provided without v', (done) => {
    service.getPersonByUuid(personUuid).subscribe((_response) => {
      expect(req.request.urlWithParams).toContain(`person/${personUuid}?v=full`);
      expect(req.request.method).toBe('GET');
      done();
    });
    const req = httpMock.expectOne(`${service.getUrl()}/${personUuid}?v=full`);
    req.flush(JSON.stringify({}));
  });

  it('should return a person when the correct uuid is provided with v', (done) => {
    service.getPersonByUuid(personUuid, '9').subscribe((_response) => {
      expect(req.request.urlWithParams).toContain(`person/${personUuid}?v=9`);
      expect(req.request.method).toBe('GET');
      done();
    });
    const req = httpMock.expectOne(`${service.getUrl()}/${personUuid}?v=9`);
    req.flush(JSON.stringify({}));
  });

  it('should save a person', (done) => {
    service.saveUpdatePerson(personUuid, personPayload).subscribe((_response) => {
      done();
    });

    const req = httpMock.expectOne(service.getUrl() + '/' + personUuid);
    expect(req.request.url).toContain('person/' + personUuid);
    expect(req.request.method).toBe('POST');
    req.flush(JSON.stringify({}));
  });
});
