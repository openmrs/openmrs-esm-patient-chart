import { TestBed } from '@angular/core/testing';
import { FormSchemaService } from './form-schema.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormResourceService } from '../openmrs-api/form-resource.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { FormSchemaCompiler } from '@openmrs/ngx-formentry';

describe('Service: FormSchemaService', () => {
  let formSchemaService: FormSchemaService;
  let formsResourceService: FormResourceService;
  let localStorageService: LocalStorageService;

  // mock data for formMetaData
  const formMetaData: any = {
    uuid: 'adult-return-formMetaData-uuid',
    display: 'Adult Return Visit Form v0.01',
    resources: [
      {
        dataType: 'AmpathJsonSchema',
        name: 'json schema',
        uuid: '57991389-dbd4-4d15-8802-4b1ac560fb57',
        valueReference: 'adult-return-formClobData-uuid',
      },
    ],
  };

  // mock data for formClobData
  const formClobData: any = {
    uuid: 'adult-return-formClobData-uuid',
    name: 'Adult Return Visit Form v0.01',
    referencedForms: [
      {
        formName: 'component_vitals',
        alias: 'vt',
        ref: {
          uuid: 'component_vitals_formMetaData-uuid',
          display: 'vitals component',
        },
      },
      {
        formName: 'component_social-history',
        alias: 'sh',
        ref: {
          uuid: 'component_social-history_formMetaData-uuid',
          display: 'social history component',
        },
      },
    ],
  };

  // mock data for compiledSchema
  const compiledSchema: any = {
    uuid: 'form-uuid',
    formMetaData,
    formClobData,
  };

  // configure test bed
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
      providers: [FormSchemaService, LocalStorageService, FormSchemaCompiler, FormResourceService],
      imports: [HttpClientTestingModule],
    });
    formSchemaService = TestBed.inject(FormSchemaService);
    formsResourceService = TestBed.inject(FormResourceService);
    localStorageService = TestBed.inject(LocalStorageService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create an instance of FormSchemaService', () => {
    expect(formSchemaService).toBeTruthy();
  });

  it('should have all required methods defined and exposed as a public member ' + 'for the first time', () => {
    expect(formSchemaService.getFormSchemaByUuid).toBeTruthy();
  });
});
