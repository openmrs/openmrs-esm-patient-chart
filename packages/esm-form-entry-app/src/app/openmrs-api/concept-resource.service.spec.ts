import { TestBed, waitForAsync } from '@angular/core/testing';
import { ConceptResourceService } from './concept-resource.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { OpenmrsApiModule } from './openmrs-api.module';
// Load the implementations that should be tested

describe('Service : ConceptResourceService Unit Tests', () => {
  let conceptResourceService: ConceptResourceService;
  let httpMock: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [OpenmrsApiModule],
      declarations: [],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    conceptResourceService = TestBed.inject(ConceptResourceService);
    httpMock = TestBed.inject(HttpTestingController);
  }));
  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should be injected with all dependencies', () => {
    expect(conceptResourceService).toBeTruthy();
  });

  it('should return a concept when the correct uuid is provided with v', (done) => {
    const conceptUuid = 'a8945ba0-1350-11df-a1f1-0026b9348838';

    conceptResourceService.getConceptByUuid(conceptUuid, false, '9').subscribe((res) => {
      expect(res).toEqual('concept');
      expect(request.request.urlWithParams).toContain('concept/' + conceptUuid + '?v=9');
      expect(request.request.method).toBe('GET');
      done();
    });

    const request = httpMock.expectOne(conceptResourceService.getUrl() + '/' + conceptUuid + '?v=9');
    request.flush('concept');
  });

  it('should return a concept when the correct uuid is provided without v', (done) => {
    const conceptUuid = 'a8945ba0-1350-11df-a1f1-0026b9348838';

    conceptResourceService.getConceptByUuid(conceptUuid).subscribe((res) => {
      expect(res).toEqual('concept');
      expect(request.request.urlWithParams).toContain(
        'concept/' + conceptUuid + '?v=custom:(uuid,name,conceptClass,setMembers)',
      );
      expect(request.request.method).toBe('GET');
      done();
    });
    const request = httpMock.expectOne(
      conceptResourceService.getUrl() + '/' + conceptUuid + '?v=custom:(uuid,name,conceptClass,setMembers)',
    );
    request.flush('concept');
  });

  it('should return a list of concepts a matching search string  provided without v', (done) => {
    const searchText = 'test';
    const res = [
      {
        uuid: 'uuid',
        conceptClass: {
          uuid: 'uuid',
          description: 'acquired',
          display: 'test',
        },
        name: {
          conceptNameType: 'conceptNameType',
          display: 'BRUCELLA TEST',
        },
      },
    ];
    conceptResourceService.searchConcept(searchText).subscribe((_data) => {
      expect(res.length).toBeGreaterThan(0);
      expect(req.request.method).toBe('GET');
      expect(req.request.urlWithParams).toContain('concept?q=test&v=custom:(uuid,name,conceptClass,setMembers)');
      done();
    });

    const req = httpMock.expectOne(
      conceptResourceService.getUrl() + '?q=test&v=custom:(uuid,name,conceptClass,setMembers)',
    );
    req.flush(res);
  });

  it('should return a list of concepts a matching search string  provided with v', (done) => {
    const searchText = 'test';
    const res = [
      {
        uuid: 'uuid',
        conceptClass: {
          uuid: 'uuid',
          description: 'acquired',
          display: 'test',
        },
        name: {
          conceptNameType: 'conceptNameType',
          display: 'BRUCELLA TEST',
        },
      },
    ];
    conceptResourceService.searchConcept(searchText, false, '9').subscribe((_data) => {
      expect(res.length).toBeGreaterThan(0);
      expect(req.request.method).toBe('GET');
      expect(req.request.urlWithParams).toContain('concept?q=test&v=9');
      done();
    });

    const req = httpMock.expectOne(conceptResourceService.getUrl() + '?q=test&v=9');
    req.flush(res);
  });
});
