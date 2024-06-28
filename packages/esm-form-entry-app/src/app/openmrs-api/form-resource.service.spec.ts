import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormResourceService } from './form-resource.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { WindowRef } from '../window-ref';
// Load the implementations that should be tested

describe('FormResourceService Unit Tests', () => {
  let formsResourceService: FormResourceService;
  let httpMock: HttpTestingController;
  let winRef: WindowRef;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [],
      providers: [FormResourceService, LocalStorageService, WindowRef],
    });

    formsResourceService = TestBed.get(FormResourceService);
    httpMock = TestBed.get(HttpTestingController);
    winRef = TestBed.get(WindowRef);
  }));

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should have Forms resource defined', () => {
    expect(formsResourceService).toBeDefined();
  });

  it('should make API call with correct URL when getFormMetaDataByUuid is invoked without v', fakeAsync(() => {
    const uuid = 'form-uuid';
    tick(50);

    formsResourceService.getFormMetaDataByUuid(uuid).subscribe();

    const req = httpMock.expectOne(winRef.openmrsRestBase.trim() + 'form/' + uuid + '?v=full');
    expect(req.request.method).toBe('GET');
    expect(req.request.urlWithParams).toContain(`/ws/rest/v1/form/form-uuid?v=full`);
  }));

  it('should make API call with correct URL when getFormMetaDataByUuid is invoked with v', fakeAsync(() => {
    const uuid = 'form-uuid';
    tick(50);

    formsResourceService.getFormMetaDataByUuid(uuid, '9').subscribe();

    const req = httpMock.expectOne(winRef.openmrsRestBase.trim() + 'form/' + uuid + '?v=9');
    expect(req.request.method).toBe('GET');
    expect(req.request.urlWithParams).toContain('/ws/rest/v1/form/form-uuid?v=9');
  }));

  it('should return a form object when getFormMetaDataByUuid is invoked without v', (done) => {
    const uuid = 'form-uuid';
    const options = {
      uuid: 'xxx-xxx-xxx-xxx',
      display: 'form resource',
    };

    formsResourceService.getFormMetaDataByUuid(uuid).subscribe((data) => {
      expect(data.uuid).toBeTruthy();
      done();
    });

    const req = httpMock.expectOne(winRef.openmrsRestBase.trim() + 'form/' + uuid + '?v=full');
    expect(req.request.method).toBe('GET');
    req.flush(options);
  });

  it('should return a form object when getFormMetaDataByUuid is invoked with v', (done) => {
    const uuid = 'form-uuid';
    const options = {
      uuid: 'xxx-xxx-xxx-xxx',
      display: 'form resource',
    };

    formsResourceService.getFormMetaDataByUuid(uuid, '9').subscribe((data) => {
      expect(data.uuid).toBeTruthy();
      done();
    });

    const req = httpMock.expectOne(winRef.openmrsRestBase.trim() + 'form/' + uuid + '?v=9');
    expect(req.request.method).toBe('GET');
    req.flush(options);
  });
});
