import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';
import { throwError as observableThrowError, of } from 'rxjs';

import { FormSubmissionService } from './form-submission.service';
import { OpenmrsApiModule } from '../openmrs-api/openmrs-api.module';
import { EncounterResourceService } from '../openmrs-api/encounter-resource.service';
import { PersonAttributeAdapter, Form, EncounterAdapter, FormEntryModule } from '@openmrs/ngx-formentry';
import { PersonResourceService } from '../openmrs-api/person-resource.service';
import { FormDataSourceService } from '../form-data-source/form-data-source.service';
import { LocalStorageService } from '../local-storage/local-storage.service';

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

  // previous encs
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
    searchNodeByQuestionId: (_param) => {
      return [];
    },
  } as Form;

  // sample submission error
  const sampleSubmissionError: any = {
    code: 'org.openmrs.module.webservices.rest.web.resource.impl.BaseDelegatingResource:748',
    // tslint:disable-next-line:max-line-length
    detail: 'org.openmrs.module.webservices.rest.web.response.ConversionException: unknown provider ↵',
    message: 'Unable to convert object into response content',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
      providers: [FormSubmissionService, FormDataSourceService, LocalStorageService],
      imports: [HttpClientTestingModule, OpenmrsApiModule, FormEntryModule],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create an instance of FormSubmissionService', () => {
    const service: FormSubmissionService = TestBed.get(FormSubmissionService);
    expect(service).toBeTruthy();
  });

  it('should submit payload when supplied with a valid form object:: New Form', inject(
    [FormSubmissionService, EncounterResourceService, PersonAttributeAdapter, EncounterAdapter, PersonResourceService],
    (
      formSchemaService: FormSubmissionService,
      encounterResourceService: EncounterResourceService,
      personAttributeAdapter: PersonAttributeAdapter,
      encounterAdapter: EncounterAdapter,
      personResourceService: PersonResourceService,
    ) => {
      // spy encounterResourceService
      spyOn(encounterResourceService, 'saveEncounter').and.callFake((_payload) => {
        return of({} as any);
      });

      // spy personResourceService
      spyOn(personResourceService, 'saveUpdatePerson').and.callFake((_payload) => {
        return of({} as any);
      });

      // encounter adaptor
      spyOn(encounterAdapter, 'generateFormPayload').and.callFake((_payload) => {
        return sampleEncounterPayload;
      });

      // person attributes adaptor
      spyOn(personAttributeAdapter, 'generateFormPayload').and.callFake((_payload) => {
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

  it('should submit payload when supplied with a valid form object:: Editting Form', inject(
    [FormSubmissionService, EncounterResourceService, PersonAttributeAdapter, EncounterAdapter, PersonResourceService],
    (
      formSchemaService: FormSubmissionService,
      encounterResourceService: EncounterResourceService,
      personAttributeAdapter: PersonAttributeAdapter,
      encounterAdapter: EncounterAdapter,
      personResourceService: PersonResourceService,
    ) => {
      // spy encounterResourceService
      spyOn(encounterResourceService, 'saveEncounter').and.callFake((_payload) => {
        return of({} as any);
      });

      // spy personResourceService
      spyOn(personResourceService, 'saveUpdatePerson').and.callFake((_payload) => {
        return of({} as any);
      });

      // encounter adaptor
      spyOn(encounterAdapter, 'generateFormPayload').and.callFake((_payload) => {
        return sampleEncounterPayload;
      });

      // person attributes adaptor
      spyOn(personAttributeAdapter, 'generateFormPayload').and.callFake((_payload) => {
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
      spyOn(personResourceService, 'saveUpdatePerson').and.callFake((_payload) => {
        return of({} as any);
      });
      // encounter adaptor
      spyOn(encounterAdapter, 'generateFormPayload').and.callFake((_payload) => {
        return {}; // setting it to empty
      });

      // person attributes adaptor
      spyOn(personAttributeAdapter, 'generateFormPayload').and.callFake((_payload) => {
        return []; // setting it to empty
      });
      // renderable form has no obs, no orders, no encounter and no person attribute
      formSchemaService.submitPayload(renderableForm as Form);
      expect(personResourceService.saveUpdatePerson).not.toHaveBeenCalled();
    },
  ));

  it(
    'should not submit encounter payload if generated payload is null or empty' + ' :: Case when creating new form',
    inject(
      [
        FormSubmissionService,
        EncounterResourceService,
        PersonAttributeAdapter,
        EncounterAdapter,
        PersonResourceService,
      ],
      (
        formSchemaService: FormSubmissionService,
        encounterResourceService: EncounterResourceService,
        personAttributeAdapter: PersonAttributeAdapter,
        encounterAdapter: EncounterAdapter,
        _personResourceService: PersonResourceService,
      ) => {
        // case when creating new encounter
        spyOn(encounterResourceService, 'saveEncounter').and.callFake((_payload) => {
          return of({} as any);
        });

        // case when creating new encounter
        spyOn(encounterResourceService, 'updateEncounter').and.callFake((_payload) => {
          return of({} as any);
        });
        // encounter adaptor
        spyOn(encounterAdapter, 'generateFormPayload').and.callFake((_payload) => {
          return {};
        });

        // person attributes adaptor
        spyOn(personAttributeAdapter, 'generateFormPayload').and.callFake((_payload) => {
          return [];
        });
        // renderable form has no obs, no orders, no encounter
        formSchemaService.submitPayload(renderableForm as Form);
        expect(encounterResourceService.saveEncounter).not.toHaveBeenCalled();
        expect(encounterResourceService.updateEncounter).not.toHaveBeenCalled();
      },
    ),
  );

  it(
    'should not submit encounter payload if generated payload is null or empty' +
      ' :: Case when editting existing form',
    inject(
      [
        FormSubmissionService,
        EncounterResourceService,
        PersonAttributeAdapter,
        EncounterAdapter,
        PersonResourceService,
      ],
      (
        formSchemaService: FormSubmissionService,
        encounterResourceService: EncounterResourceService,
        personAttributeAdapter: PersonAttributeAdapter,
        encounterAdapter: EncounterAdapter,
        _personResourceService: PersonResourceService,
      ) => {
        // case when creating new encounter
        spyOn(encounterResourceService, 'saveEncounter').and.callFake((_payload) => {
          return of({} as any);
        });

        // case when creating new encounter
        spyOn(encounterResourceService, 'updateEncounter').and.callFake((_payload) => {
          return of({} as any);
        });
        // encounter adaptor
        spyOn(encounterAdapter, 'generateFormPayload').and.callFake((_payload) => {
          return {};
        });

        // person attributes adaptor
        spyOn(personAttributeAdapter, 'generateFormPayload').and.callFake((_payload) => {
          return [];
        });
        // renderable form has no obs, no orders, no encounter
        renderableForm.valueProcessingInfo.encounterUuid = 'sample-uuid';
        formSchemaService.submitPayload(renderableForm as Form);
        expect(encounterResourceService.saveEncounter).not.toHaveBeenCalled();
        expect(encounterResourceService.updateEncounter).not.toHaveBeenCalled();
      },
    ),
  );

  it('should throw error when encounter payload fails to save', inject(
    [FormSubmissionService, EncounterResourceService, PersonAttributeAdapter, EncounterAdapter, PersonResourceService],
    (
      formSchemaService: FormSubmissionService,
      encounterResourceService: EncounterResourceService,
      personAttributeAdapter: PersonAttributeAdapter,
      encounterAdapter: EncounterAdapter,
      personResourceService: PersonResourceService,
    ) => {
      // spy encounterResourceService
      spyOn(encounterResourceService, 'saveEncounter').and.callFake((_payload) => {
        // throw an error
        return observableThrowError(sampleSubmissionError);
      });

      // spy personResourceService
      spyOn(personResourceService, 'saveUpdatePerson').and.callFake((_payload) => {
        return of({} as any);
      });

      // encounter adaptor
      spyOn(encounterAdapter, 'generateFormPayload').and.callFake((_payload) => {
        return sampleEncounterPayload;
      });

      // person attributes adaptor
      spyOn(personAttributeAdapter, 'generateFormPayload').and.callFake((_payload) => {
        return [
          {
            attributeType: 'attribute-type-uuid',
            value: 'Test Race',
          },
        ];
      });

      // spy on
      let formSubmissionSuccesIndicator = false;
      let submissionError: any = null;
      formSchemaService.submitPayload(renderableForm as Form).subscribe(
        (_response) => {
          formSubmissionSuccesIndicator = true;
          submissionError = null;
          // tslint:disable-next-line:no-unused-expression
          expect(formSubmissionSuccesIndicator).toBeFalsy;
        },
        (err) => {
          console.error('An error occurred, ---->', err);
          submissionError = err;
          formSubmissionSuccesIndicator = false;
        },
      );
      expect(encounterResourceService.saveEncounter).toHaveBeenCalled();
      expect(personResourceService.saveUpdatePerson).toHaveBeenCalled();
      // we expect it to throw error
      // tslint:disable-next-line:no-unused-expression
      expect(formSubmissionSuccesIndicator).toBeFalsy;
      // tslint:disable-next-line:no-unused-expression
      expect(submissionError).not.toBeNull;
    },
  ));

  it('should throw error when personAttribute payload fails to save', inject(
    [FormSubmissionService, EncounterResourceService, PersonAttributeAdapter, EncounterAdapter, PersonResourceService],
    (
      formSchemaService: FormSubmissionService,
      encounterResourceService: EncounterResourceService,
      personAttributeAdapter: PersonAttributeAdapter,
      encounterAdapter: EncounterAdapter,
      personResourceService: PersonResourceService,
    ) => {
      // spy encounterResourceService
      spyOn(encounterResourceService, 'saveEncounter').and.callFake((_payload) => {
        return of({} as any);
      });

      // spy personResourceService
      spyOn(personResourceService, 'saveUpdatePerson').and.callFake((_payload) => {
        // Throw an error
        return observableThrowError(sampleSubmissionError);
      });

      // encounter adaptor
      spyOn(encounterAdapter, 'generateFormPayload').and.callFake((_payload) => {
        return sampleEncounterPayload;
      });

      // person attributes adaptor
      spyOn(personAttributeAdapter, 'generateFormPayload').and.callFake((_payload) => {
        return [
          {
            attributeType: 'attribute-type-uuid',
            value: 'Test Race',
          },
        ];
      });

      // spy on
      let formSubmissionSuccesIndicator = false;
      let submissionError: any = null;
      formSchemaService.submitPayload(renderableForm as Form).subscribe(
        (_response) => {
          formSubmissionSuccesIndicator = true;
          submissionError = null;
          // tslint:disable-next-line:no-unused-expression
          expect(formSubmissionSuccesIndicator).toBeFalsy;
        },
        (err) => {
          console.error('An error occurred, ---->', err);
          submissionError = err;
          formSubmissionSuccesIndicator = false;
        },
      );
      expect(encounterResourceService.saveEncounter).toHaveBeenCalled();
      expect(personResourceService.saveUpdatePerson).toHaveBeenCalled();
      // we expect it to throw error
      // tslint:disable-next-line:no-unused-expression
      expect(formSubmissionSuccesIndicator).toBeFalsy;
      // tslint:disable-next-line:no-unused-expression
      expect(submissionError).not.toBeNull;
    },
  ));

  it('should throw error when all payloads fail to save', inject(
    [FormSubmissionService, EncounterResourceService, PersonAttributeAdapter, EncounterAdapter, PersonResourceService],
    (
      formSchemaService: FormSubmissionService,
      encounterResourceService: EncounterResourceService,
      personAttributeAdapter: PersonAttributeAdapter,
      encounterAdapter: EncounterAdapter,
      personResourceService: PersonResourceService,
    ) => {
      // spy encounterResourceService
      spyOn(encounterResourceService, 'saveEncounter').and.callFake((_payload) => {
        // Throw an error
        return observableThrowError(sampleSubmissionError);
      });

      // spy personResourceService
      spyOn(personResourceService, 'saveUpdatePerson').and.callFake((_payload) => {
        // Throw an error
        return observableThrowError(sampleSubmissionError);
      });

      // encounter adaptor
      spyOn(encounterAdapter, 'generateFormPayload').and.callFake((_payload) => {
        return sampleEncounterPayload;
      });

      // person attributes adaptor
      spyOn(personAttributeAdapter, 'generateFormPayload').and.callFake((_payload) => {
        return [
          {
            attributeType: 'attribute-type-uuid',
            value: 'Test Race',
          },
        ];
      });

      // spy on
      let formSubmissionSuccesIndicator = false;
      let submissionError: any = null;
      formSchemaService.submitPayload(renderableForm as Form).subscribe(
        (_response) => {
          formSubmissionSuccesIndicator = true;
          submissionError = null;
          // tslint:disable-next-line:no-unused-expression
          expect(formSubmissionSuccesIndicator).toBeFalsy;
        },
        (err) => {
          console.error('An error occurred, ---->', err);
          submissionError = err;
          formSubmissionSuccesIndicator = false;
        },
      );
      expect(encounterResourceService.saveEncounter).toHaveBeenCalled();
      expect(personResourceService.saveUpdatePerson).toHaveBeenCalled();
      // we expect it to throw error
      /* tslint:disable:no-unused-expression */
      expect(formSubmissionSuccesIndicator).toBeFalsy;
      expect(submissionError).not.toBeNull;
    },
  ));
});
