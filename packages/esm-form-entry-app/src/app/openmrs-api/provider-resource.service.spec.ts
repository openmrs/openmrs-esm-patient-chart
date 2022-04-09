import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

import { ProviderResourceService } from './provider-resource.service';
import { OpenmrsApiModule } from './openmrs-api.module';

describe('Service : ProviderResourceService Unit Tests', () => {
  let providerResourceService: ProviderResourceService;
  let httpMock: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, OpenmrsApiModule],
      declarations: [],
      providers: [],
    });

    providerResourceService = TestBed.get(ProviderResourceService);
    httpMock = TestBed.get(HttpTestingController);
  }));

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should be injected with all dependencies', () => {
    expect(providerResourceService).toBeTruthy();
  });

  it('should return a provider when the correct uuid is provided', (done) => {
    const providerUuid = 'xxx-xxx-xxx-xxx';

    providerResourceService.getProviderByUuid(providerUuid).subscribe((response) => {
      expect(req.request.method).toBe('GET');
      done();
    });

    const req = httpMock.expectOne(providerResourceService.getUrl(providerUuid));
    req.flush(JSON.stringify({}));
  });

  it('should return a list of providers a matching search string is provided', (done) => {
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

    providerResourceService.searchProvider(searchText).subscribe((providers) => {
      for (const provider of providers) {
        expect(provider.display).toContain('test');
      }
      done();
    });

    const req = httpMock.expectOne(providerResourceService.getUrl());
    req.flush(results);
  });
});
