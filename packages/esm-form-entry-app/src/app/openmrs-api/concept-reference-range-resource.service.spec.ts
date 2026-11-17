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

  it('should follow the next link until the backend runs out of pages', (done) => {
    conceptReferenceRangeResourceService
      .getConceptReferenceRanges('patient-uuid', ['temperature-uuid', 'pulse-uuid'])
      .subscribe((referenceRanges) => {
        expect(referenceRanges.size).toBe(2);
        expect(referenceRanges.get('temperature-uuid').hiAbsolute).toBe(43);
        expect(referenceRanges.get('pulse-uuid').hiAbsolute).toBe(230);
        done();
      });

    const nextPageUri = `${conceptReferenceRangeResourceService.getUrl()}?patient=patient-uuid&startIndex=1`;

    httpMock
      .expectOne((req) => req.url === conceptReferenceRangeResourceService.getUrl())
      .flush({
        results: [{ uuid: 'range-1', concept: 'temperature-uuid', lowAbsolute: 25, hiAbsolute: 43 }],
        links: [{ rel: 'next', uri: nextPageUri }],
      });

    httpMock.expectOne(nextPageUri).flush({
      results: [{ uuid: 'range-2', concept: 'pulse-uuid', lowAbsolute: 0, hiAbsolute: 230 }],
    });
  });

  it('should split large forms into bounded requests', (done) => {
    const concepts = Array.from({ length: 57 }, (_, index) => `concept-${index}`);

    conceptReferenceRangeResourceService
      .getConceptReferenceRanges('patient-uuid', concepts)
      .subscribe((referenceRanges) => {
        expect(requests.length).toBe(3);
        expect(requests[0].request.params.get('concept').split(',').length).toBe(25);
        expect(requests[2].request.params.get('concept').split(',').length).toBe(7);
        expect(referenceRanges.size).toBe(3);
        done();
      });

    const requests = httpMock.match((req) => req.url === conceptReferenceRangeResourceService.getUrl());
    requests.forEach((request, index) =>
      request.flush({
        results: [{ uuid: `range-${index}`, concept: `concept-${index * 25}`, lowAbsolute: 0, hiAbsolute: 100 }],
      }),
    );
  });

  it('should keep the ranges of the batches which succeeded when one of them fails', (done) => {
    spyOn(console, 'error');

    const concepts = Array.from({ length: 30 }, (_, index) => `concept-${index}`);

    conceptReferenceRangeResourceService
      .getConceptReferenceRanges('patient-uuid', concepts)
      .subscribe((referenceRanges) => {
        expect(referenceRanges.size).toBe(1);
        expect(referenceRanges.get('concept-0')).toBeDefined();
        done();
      });

    const requests = httpMock.match((req) => req.url === conceptReferenceRangeResourceService.getUrl());
    expect(requests.length).toBe(2);

    requests[0].flush({
      results: [{ uuid: 'range-0', concept: 'concept-0', lowAbsolute: 0, hiAbsolute: 100 }],
    });
    requests[1].flush('Unknown concept', { status: 500, statusText: 'Internal Server Error' });
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
