import { TestBed, waitForAsync } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

import { PersonResourceService } from './person-resource.service';
import { OpenmrsApiModule } from './openmrs-api.module';

// Load the implementations that should be tested

describe('PersonResourceService', () => {
  let service: PersonResourceService;
  let httpMock: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, OpenmrsApiModule],
      declarations: [],
      providers: [],
    });

    service = TestBed.get(PersonResourceService);
    httpMock = TestBed.get(HttpTestingController);
  }));

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  const personuid = 'uuid';
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
    service.getPersonByUuid(personuid).subscribe((response) => {
      expect(req.request.urlWithParams).toContain(`person/${personuid}?v=full`);
      expect(req.request.method).toBe('GET');
      done();
    });
    const req = httpMock.expectOne(`${service.getUrl()}/${personuid}?v=full`);
    req.flush(JSON.stringify({}));
  });

  it('should return a person when the correct uuid is provided with v', (done) => {
    service.getPersonByUuid(personuid, '9').subscribe((response) => {
      expect(req.request.urlWithParams).toContain(`person/${personuid}?v=9`);
      expect(req.request.method).toBe('GET');
      done();
    });
    const req = httpMock.expectOne(`${service.getUrl()}/${personuid}?v=9`);
    req.flush(JSON.stringify({}));
  });

  it('should save a person', (done) => {
    service.saveUpdatePerson(personuid, personPayload).subscribe((response) => {
      done();
    });

    const req = httpMock.expectOne(service.getUrl() + '/' + personuid);
    expect(req.request.url).toContain('person/' + personuid);
    expect(req.request.method).toBe('POST');
    req.flush(JSON.stringify({}));
  });
});
