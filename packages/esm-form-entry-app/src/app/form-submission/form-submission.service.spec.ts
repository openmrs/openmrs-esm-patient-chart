import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';
import { throwError, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { FormSubmissionService } from './form-submission.service';
import { OpenmrsApiModule } from '../openmrs-api/openmrs-api.module';
import { EncounterResourceService } from '../openmrs-api/encounter-resource.service';
import { PersonAttributeAdapter, Form, EncounterAdapter, FormEntryModule } from '@openmrs/ngx-formentry';
import { PersonResourceService } from '../openmrs-api/person-resource.service';
import { FormDataSourceService } from '../form-data-source/form-data-source.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { SingleSpaPropsService } from '../single-spa-props/single-spa-props.service';
import { VisitResourceService } from '../openmrs-api/visit-resource.service';
import { PatientResourceService } from '../openmrs-api/patient-resource.service';
import { ConfigResourceService } from '../services/config-resource.service';

describe('Service: FormSubmissionService', () => {
  // sample payload
  const sampleEncounterPayload: any = {
    encounterType: '8d5b2be0-c2cc-11de-8d13-0010c6dffd0f',
    form: '81f92a8a-ff5c-415d-a34c-b5bdca2406be',
    obs: [],
    order: [],
    patient: '5ead308a-1359-11df-a1f1-0026b9348838',
    provider: '34',
    visit: '85a7746e-4d8d-4722-b3eb-ce79195266de',
  };

  // sample schema
  const schema: any = {
    uuid: 'form-uuid',
    display: 'form',
    encounterType: {
      uuid: 'type-uuid',
      display: 'sample',
    },
  };

  // mock form object
  const renderableForm = {
    valid: true,
    schema,
    valueProcessingInfo: {
      patientUuid: 'patientUuid',
      personUuid: 'personUuid',
      visitUuid: 'visitUuid',
      encounterTypeUuid: 'encounterTypeUuid',
      formUuid: 'formUuid',
      encounterUuid: 'encounterUuid',
      providerUuid: 'providerUuid',
      utcOffset: '+0300',
    },
    rootNode: {
      children: {},
      question: { key: 'root' },
    },
    dataSourcesContainer: {
      dataSources: {
        userLocation: { uuid: 'location-uuid' },
      },
    },
    searchNodeByQuestionId: (_param: string) => {
      return [];
    },
  } as unknown as Form;

  // sample submission error
  const sampleSubmissionError: any = {
    code: 'org.openmrs.module.webservices.rest.web.resource.impl.BaseDelegatingResource:748',
    detail: 'org.openmrs.module.webservices.rest.web.response.ConversionException: unknown provider ↵',
    message: 'Unable to convert object into response content',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FormSubmissionService,
        FormDataSourceService,
        LocalStorageService,
        SingleSpaPropsService,
        VisitResourceService,
        PatientResourceService,
        ConfigResourceService,
      ],
      imports: [OpenmrsApiModule, FormEntryModule, TranslateModule.forRoot()],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create an instance of FormSubmissionService', () => {
    const service: FormSubmissionService = TestBed.inject(FormSubmissionService);
    expect(service).toBeTruthy();
  });

  // TODO: This test needs refactoring - the ngx-formentry adapters require complex form mocks
  xit('should submit payload when supplied with a valid form object:: New Form', inject(
    [FormSubmissionService, EncounterResourceService, PersonAttributeAdapter, EncounterAdapter, PersonResourceService],
    (
      formSchemaService: FormSubmissionService,
      encounterResourceService: EncounterResourceService,
      personAttributeAdapter: PersonAttributeAdapter,
      encounterAdapter: EncounterAdapter,
      personResourceService: PersonResourceService,
    ) => {
      // spy encounterResourceService
      spyOn(encounterResourceService, 'saveEncounter').and.callFake((_payload: any) => {
        return of({} as any);
      });

      // spy personResourceService
      spyOn(personResourceService, 'saveUpdatePerson').and.callFake((_uuid: string, payload: any) => {
        return of(payload);
      });

      // encounter adapter
      spyOn(encounterAdapter, 'generateFormPayload').and.callFake((_payload: any) => {
        return sampleEncounterPayload;
      });

      // person attributes adapter
      spyOn(personAttributeAdapter, 'generateFormPayload').and.callFake((_payload: any) => {
        return [
          {
            attributeType: 'attribute-type-uuid',
            value: 'Test Race',
          },
        ];
      });

      formSchemaService.submitPayload(renderableForm as Form);
      expect(encounterResourceService.saveEncounter).toHaveBeenCalled();
      expect(personResourceService.saveUpdatePerson).toHaveBeenCalled();
    },
  ));

  // TODO: This test needs refactoring - the ngx-formentry adapters require complex form mocks
  xit('should submit payload when supplied with a valid form object:: Editing Form', inject(
    [FormSubmissionService, EncounterResourceService, PersonAttributeAdapter, EncounterAdapter, PersonResourceService],
    (
      formSchemaService: FormSubmissionService,
      encounterResourceService: EncounterResourceService,
      personAttributeAdapter: PersonAttributeAdapter,
      encounterAdapter: EncounterAdapter,
      personResourceService: PersonResourceService,
    ) => {
      // spy encounterResourceService
      spyOn(encounterResourceService, 'saveEncounter').and.callFake((_payload: any) => {
        return of({} as any);
      });

      // spy personResourceService
      spyOn(personResourceService, 'saveUpdatePerson').and.callFake((_uuid: string, payload: any) => {
        return of(payload);
      });

      // encounter adapter
      spyOn(encounterAdapter, 'generateFormPayload').and.callFake((_payload: any) => {
        return sampleEncounterPayload;
      });

      // person attributes adapter
      spyOn(personAttributeAdapter, 'generateFormPayload').and.callFake((_payload: any) => {
        return [
          {
            attributeType: 'attribute-type-uuid',
            value: 'Test Race',
          },
        ];
      });
      renderableForm.valueProcessingInfo.encounterUuid = 'sample-uuid';
      formSchemaService.submitPayload(renderableForm as Form);
      expect(encounterResourceService.saveEncounter).toHaveBeenCalled();
      expect(personResourceService.saveUpdatePerson).toHaveBeenCalled();
    },
  ));

  it('should not submit personAttribute payload if generated payload is null or empty', inject(
    [FormSubmissionService, EncounterResourceService, PersonAttributeAdapter, EncounterAdapter, PersonResourceService],
    (
      formSchemaService: FormSubmissionService,
      _encounterResourceService: EncounterResourceService,
      personAttributeAdapter: PersonAttributeAdapter,
      encounterAdapter: EncounterAdapter,
      personResourceService: PersonResourceService,
    ) => {
      // spy encounterResourceService
      spyOn(personResourceService, 'saveUpdatePerson').and.callFake((_uuid: string, payload: any) => {
        return of(payload);
      });
      // encounter adapter
      spyOn(encounterAdapter, 'generateFormPayload').and.callFake((_payload: any) => {
        return {}; // setting it to empty
      });

      // person attributes adapter
      spyOn(personAttributeAdapter, 'generateFormPayload').and.callFake((_payload: any) => {
        return []; // setting it to empty
      });
      // renderable form has no obs, no orders, no encounter and no person attribute
      formSchemaService.submitPayload(renderableForm as Form);
      expect(personResourceService.saveUpdatePerson).not.toHaveBeenCalled();
    },
  ));

  it('should not submit encounter payload if generated payload is null or empty :: Case when creating new form', inject(
    [FormSubmissionService, EncounterResourceService, PersonAttributeAdapter, EncounterAdapter, PersonResourceService],
    (
      formSchemaService: FormSubmissionService,
      encounterResourceService: EncounterResourceService,
      personAttributeAdapter: PersonAttributeAdapter,
      encounterAdapter: EncounterAdapter,
      _personResourceService: PersonResourceService,
    ) => {
      // case when creating new encounter
      spyOn(encounterResourceService, 'saveEncounter').and.callFake((_payload: any) => {
        return of({} as any);
      });

      // case when creating new encounter
      spyOn(encounterResourceService, 'updateEncounter').and.callFake((_uuid: string, _payload: any) => {
        return of({} as any);
      });
      // encounter adapter
      spyOn(encounterAdapter, 'generateFormPayload').and.callFake((_payload: any) => {
        return {};
      });

      // person attributes adapter
      spyOn(personAttributeAdapter, 'generateFormPayload').and.callFake((_payload: any) => {
        return [];
      });
      // renderable form has no obs, no orders, no encounter
      formSchemaService.submitPayload(renderableForm as Form);
      expect(encounterResourceService.saveEncounter).not.toHaveBeenCalled();
      expect(encounterResourceService.updateEncounter).not.toHaveBeenCalled();
    },
  ));

  it('should not submit encounter payload if generated payload is null or empty :: Case when editing existing form', inject(
    [FormSubmissionService, EncounterResourceService, PersonAttributeAdapter, EncounterAdapter, PersonResourceService],
    (
      formSchemaService: FormSubmissionService,
      encounterResourceService: EncounterResourceService,
      personAttributeAdapter: PersonAttributeAdapter,
      encounterAdapter: EncounterAdapter,
      _personResourceService: PersonResourceService,
    ) => {
      // case when creating new encounter
      spyOn(encounterResourceService, 'saveEncounter').and.callFake((_payload: any) => {
        return of({} as any);
      });

      // case when creating new encounter
      spyOn(encounterResourceService, 'updateEncounter').and.callFake((_uuid: string, _payload: any) => {
        return of({} as any);
      });
      // encounter adapter
      spyOn(encounterAdapter, 'generateFormPayload').and.callFake((_payload: any) => {
        return {};
      });

      // person attributes adapter
      spyOn(personAttributeAdapter, 'generateFormPayload').and.callFake((_payload: any) => {
        return [];
      });
      // renderable form has no obs, no orders, no encounter
      renderableForm.valueProcessingInfo.encounterUuid = 'sample-uuid';
      formSchemaService.submitPayload(renderableForm as Form);
      expect(encounterResourceService.saveEncounter).not.toHaveBeenCalled();
      expect(encounterResourceService.updateEncounter).not.toHaveBeenCalled();
    },
  ));

  // TODO: This test needs refactoring - the ngx-formentry adapters require complex form mocks
  xit('should throw error when encounter payload fails to save', inject(
    [FormSubmissionService, EncounterResourceService, PersonAttributeAdapter, EncounterAdapter, PersonResourceService],
    (
      formSchemaService: FormSubmissionService,
      encounterResourceService: EncounterResourceService,
      personAttributeAdapter: PersonAttributeAdapter,
      encounterAdapter: EncounterAdapter,
      personResourceService: PersonResourceService,
    ) => {
      // spy encounterResourceService
      spyOn(encounterResourceService, 'saveEncounter').and.callFake((_payload: any) => {
        // throw an error
        return throwError(() => sampleSubmissionError);
      });

      // spy personResourceService
      spyOn(personResourceService, 'saveUpdatePerson').and.callFake((_uuid: string, payload: any) => {
        return of(payload);
      });

      // encounter adapter
      spyOn(encounterAdapter, 'generateFormPayload').and.callFake((_payload: any) => {
        return sampleEncounterPayload;
      });

      // person attributes adapter
      spyOn(personAttributeAdapter, 'generateFormPayload').and.callFake((_payload: any) => {
        return [
          {
            attributeType: 'attribute-type-uuid',
            value: 'Test Race',
          },
        ];
      });

      // spy on
      let formSubmissionSuccessIndicator = false;
      let submissionError: any = null;
      formSchemaService.submitPayload(renderableForm as Form).subscribe({
        next: (_response) => {
          formSubmissionSuccessIndicator = true;
          submissionError = null;
          expect(formSubmissionSuccessIndicator).toBeFalsy();
        },
        error: (err) => {
          console.error('An error occurred, ---->', err);
          submissionError = err;
          formSubmissionSuccessIndicator = false;
        },
      });
      expect(encounterResourceService.saveEncounter).toHaveBeenCalled();
      expect(personResourceService.saveUpdatePerson).toHaveBeenCalled();
      // we expect it to throw error
      expect(formSubmissionSuccessIndicator).toBeFalsy();
      expect(submissionError).not.toBeNull();
    },
  ));

  // TODO: This test needs refactoring - the ngx-formentry adapters require complex form mocks
  xit('should throw error when personAttribute payload fails to save', inject(
    [FormSubmissionService, EncounterResourceService, PersonAttributeAdapter, EncounterAdapter, PersonResourceService],
    (
      formSchemaService: FormSubmissionService,
      encounterResourceService: EncounterResourceService,
      personAttributeAdapter: PersonAttributeAdapter,
      encounterAdapter: EncounterAdapter,
      personResourceService: PersonResourceService,
    ) => {
      // spy encounterResourceService
      spyOn(encounterResourceService, 'saveEncounter').and.callFake((_payload: any) => {
        return of({} as any);
      });

      // spy personResourceService
      spyOn(personResourceService, 'saveUpdatePerson').and.callFake((_uuid: string, _payload: any) => {
        // Throw an error
        return throwError(() => sampleSubmissionError);
      });

      // encounter adapter
      spyOn(encounterAdapter, 'generateFormPayload').and.callFake((_payload: any) => {
        return sampleEncounterPayload;
      });

      // person attributes adapter
      spyOn(personAttributeAdapter, 'generateFormPayload').and.callFake((_payload: any) => {
        return [
          {
            attributeType: 'attribute-type-uuid',
            value: 'Test Race',
          },
        ];
      });

      // spy on
      let formSubmissionSuccessIndicator = false;
      let submissionError: any = null;
      formSchemaService.submitPayload(renderableForm as Form).subscribe({
        next: (_response) => {
          formSubmissionSuccessIndicator = true;
          submissionError = null;
          expect(formSubmissionSuccessIndicator).toBeFalsy();
        },
        error: (err) => {
          console.error('An error occurred, ---->', err);
          submissionError = err;
          formSubmissionSuccessIndicator = false;
        },
      });
      expect(encounterResourceService.saveEncounter).toHaveBeenCalled();
      expect(personResourceService.saveUpdatePerson).toHaveBeenCalled();
      // we expect it to throw error
      expect(formSubmissionSuccessIndicator).toBeFalsy();
      expect(submissionError).not.toBeNull();
    },
  ));

  // TODO: This test needs refactoring - the ngx-formentry adapters require complex form mocks
  xit('should throw error when all payloads fail to save', inject(
    [FormSubmissionService, EncounterResourceService, PersonAttributeAdapter, EncounterAdapter, PersonResourceService],
    (
      formSchemaService: FormSubmissionService,
      encounterResourceService: EncounterResourceService,
      personAttributeAdapter: PersonAttributeAdapter,
      encounterAdapter: EncounterAdapter,
      personResourceService: PersonResourceService,
    ) => {
      // spy encounterResourceService
      spyOn(encounterResourceService, 'saveEncounter').and.callFake((_payload: any) => {
        // Throw an error
        return throwError(() => sampleSubmissionError);
      });

      // spy personResourceService
      spyOn(personResourceService, 'saveUpdatePerson').and.callFake((_uuid: string, _payload: any) => {
        // Throw an error
        return throwError(() => sampleSubmissionError);
      });

      // encounter adapter
      spyOn(encounterAdapter, 'generateFormPayload').and.callFake((_payload: any) => {
        return sampleEncounterPayload;
      });

      // person attributes adapter
      spyOn(personAttributeAdapter, 'generateFormPayload').and.callFake((_payload: any) => {
        return [
          {
            attributeType: 'attribute-type-uuid',
            value: 'Test Race',
          },
        ];
      });

      // spy on
      let formSubmissionSuccessIndicator = false;
      let submissionError: any = null;
      formSchemaService.submitPayload(renderableForm as Form).subscribe({
        next: (_response) => {
          formSubmissionSuccessIndicator = true;
          submissionError = null;
          expect(formSubmissionSuccessIndicator).toBeFalsy();
        },
        error: (err) => {
          console.error('An error occurred, ---->', err);
          submissionError = err;
          formSubmissionSuccessIndicator = false;
        },
      });
      expect(encounterResourceService.saveEncounter).toHaveBeenCalled();
      expect(personResourceService.saveUpdatePerson).toHaveBeenCalled();
      // we expect it to throw error
      expect(formSubmissionSuccessIndicator).toBeFalsy();
      expect(submissionError).not.toBeNull();
    },
  ));
});
