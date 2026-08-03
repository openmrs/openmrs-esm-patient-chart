import { TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ConceptReferenceRangeResourceService } from './concept-reference-range-resource.service';
import { OpenmrsApiModule } from './openmrs-api.module';

describe('Service: ConceptReferenceRangeResourceService', () => {
  let conceptReferenceRangeResourceService: ConceptReferenceRangeResourceService;
  let httpMock: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [OpenmrsApiModule],
      declarations: [],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    conceptReferenceRangeResourceService = TestBed.inject(ConceptReferenceRangeResourceService);
    httpMock = TestBed.inject(HttpTestingController);
  }));

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should be injected with all dependencies', () => {
    expect(conceptReferenceRangeResourceService).toBeTruthy();
  });

  it('should fetch the ranges of all requested concepts for the given patient', (done) => {
    conceptReferenceRangeResourceService
      .getConceptReferenceRanges('patient-uuid', ['temperature-uuid', 'pulse-uuid'])
      .subscribe((referenceRanges) => {
        expect(request.request.method).toBe('GET');
        expect(request.request.urlWithParams).toContain(
          'conceptreferencerange?patient=patient-uuid&concept=temperature-uuid,pulse-uuid&v=full',
        );
        expect(referenceRanges.size).toBe(2);
        expect(referenceRanges.get('temperature-uuid').hiAbsolute).toBe(43);
        done();
      });

    const request = httpMock.expectOne((req) => req.url === conceptReferenceRangeResourceService.getUrl());
    request.flush({
      results: [
        { uuid: 'range-1', concept: 'temperature-uuid', lowAbsolute: 25, hiAbsolute: 43 },
        { uuid: 'range-2', concept: 'pulse-uuid', lowAbsolute: 0, hiAbsolute: 230 },
      ],
    });
  });

  it('should not make a request when there is no patient or no concept', (done) => {
    conceptReferenceRangeResourceService.getConceptReferenceRanges(null, ['temperature-uuid']).subscribe((ranges) => {
      expect(ranges.size).toBe(0);

      conceptReferenceRangeResourceService.getConceptReferenceRanges('patient-uuid', []).subscribe((emptyRanges) => {
        expect(emptyRanges.size).toBe(0);
        done();
      });
    });

    httpMock.expectNone(() => true);
  });

  it('should resolve to an empty map when the backend does not support reference ranges', (done) => {
    spyOn(console, 'error');

    conceptReferenceRangeResourceService
      .getConceptReferenceRanges('patient-uuid', ['temperature-uuid'])
      .subscribe((referenceRanges) => {
        expect(referenceRanges.size).toBe(0);
        done();
      });

    httpMock
      .expectOne((req) => req.url === conceptReferenceRangeResourceService.getUrl())
      .flush('Unknown resource', { status: 404, statusText: 'Not Found' });
  });
});
