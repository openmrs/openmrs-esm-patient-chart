import { TestBed } from '@angular/core/testing';
import { FormSchemaService } from './form-schema.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormResourceService } from '../openmrs-api/form-resource.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { FormSchemaCompiler } from '@openmrs/ngx-formentry';
import { TranslateModule } from '@ngx-translate/core';

describe('Service: FormSchemaService', () => {
  let formSchemaService: FormSchemaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FormSchemaService,
        LocalStorageService,
        FormSchemaCompiler,
        FormResourceService,
      ],
      imports: [TranslateModule.forRoot()],
    });
    formSchemaService = TestBed.inject(FormSchemaService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create an instance of FormSchemaService', () => {
    expect(formSchemaService).toBeTruthy();
  });

  it('should have getFormSchemaByUuid method defined', () => {
    expect(formSchemaService.getFormSchemaByUuid).toBeTruthy();
  });
});
