import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import {
  DataSources,
  EndpointDataSource,
  FormEntryModule,
  FormFactory,
  PatientIdentifierAdapter,
} from '@openmrs/ngx-formentry';
import { CreateFormParams, FormCreationService } from './form-creation.service';
import { FormDataSourceService } from '../form-data-source/form-data-source.service';
import { MonthlyScheduleResourceService } from '../services/monthly-scheduled-resource.service';
import { ConfigResourceService } from '../services/config-resource.service';
import { SingleSpaPropsService } from '../single-spa-props/single-spa-props.service';
import { singleSpaPropsSubject } from '../../single-spa-props';

describe('Service: FormCreationService', () => {
  const schema: any = {
    uuid: 'form-uuid',
    display: 'form',
    encounterType: {
      uuid: 'type-uuid',
      display: 'sample',
    },
  };

  const mockForm: any = {
    schema,
    valueProcessingInfo: {},
    searchNodeByQuestionId: () => [],
  };

  const createFormParams: CreateFormParams = {
    formSchema: schema,
    session: {
      sessionLocation: { uuid: 'location-uuid' },
      currentProvider: { uuid: 'provider-uuid' },
    } as any,
    patientIdentifiers: [],
  };

  let config: any;

  beforeEach(() => {
    config = { dataSources: {}, customDataSources: [] };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FormCreationService,
        SingleSpaPropsService,
        { provide: FormFactory, useValue: { createForm: () => mockForm } },
        { provide: PatientIdentifierAdapter, useValue: { populateForm: () => {} } },
        {
          provide: FormDataSourceService,
          useValue: {
            getDataSources: () => ({
              location: {},
              provider: {},
              drug: {},
              problem: {},
              conceptAnswers: {},
              diagnoses: {},
              recentObs: () => Promise.resolve({}),
            }),
            getPatientObject: () => ({}),
          },
        },
        { provide: MonthlyScheduleResourceService, useValue: {} },
        {
          provide: ConfigResourceService,
          useValue: { getConfig: () => config },
        },
      ],
      imports: [FormEntryModule, TranslateModule.forRoot()],
    });

    singleSpaPropsSubject.next({
      patient: { id: 'patient-uuid' },
      patientUuid: 'patient-uuid',
      formUuid: 'form-uuid',
      visitUuid: 'visit-uuid',
      visitTypeUuid: 'visit-type-uuid',
    } as any);
  });

  afterEach(() => {
    delete (window as any)['_test_custom_module'];
    TestBed.resetTestingModule();
  });

  it('should create an instance of FormCreationService', () => {
    const service: FormCreationService = TestBed.inject(FormCreationService);
    expect(service).toBeTruthy();
  });

  it('should keep the built-in endpoint data source registered after form creation', async () => {
    const service: FormCreationService = TestBed.inject(FormCreationService);
    const dataSources: DataSources = TestBed.inject(DataSources);

    // Registered by the FormEntryModule constructor.
    expect(dataSources.dataSources['endpoint']).toEqual(jasmine.any(EndpointDataSource));

    await service.initAndCreateForm(createFormParams);

    // The endpoint data source must survive the clearing done during form creation.
    expect(dataSources.dataSources['endpoint']).toEqual(jasmine.any(EndpointDataSource));
    expect(dataSources.dataSources['provider']).toBeDefined();
  });

  it('should let a configured custom data source named endpoint override the built-in one', async () => {
    const customEndpointDataSource = { searchOptions: () => undefined };
    (window as any)['_test_custom_module'] = {
      init: () => {},
      get: () => Promise.resolve(() => ({ customEndpoint: customEndpointDataSource })),
    };
    config = {
      dataSources: {},
      customDataSources: [{ name: 'endpoint', moduleName: '@test/custom-module', moduleExport: 'customEndpoint' }],
    };

    const service: FormCreationService = TestBed.inject(FormCreationService);
    const dataSources: DataSources = TestBed.inject(DataSources);

    await service.initAndCreateForm(createFormParams);
    // Custom data source loading is not awaited by wireDataSources; flush it before asserting.
    await new Promise((resolve) => setTimeout(resolve));

    expect(dataSources.dataSources['endpoint']).toBe(customEndpointDataSource);
  });
});

describe('Service: FormCreationService, concept reference ranges', () => {
  const session: any = {
    sessionLocation: { uuid: 'location-uuid' },
    currentProvider: { uuid: 'provider-uuid' },
  };

  function buildSchema() {
    return {
      uuid: 'form-uuid',
      display: 'Vitals',
      encounterType: { uuid: 'type-uuid', display: 'Vitals' },
      pages: [
        {
          label: 'Vitals',
          sections: [
            {
              label: 'Vitals',
              isExpanded: 'true',
              questions: [
                {
                  label: 'Temperature',
                  id: 'temperature',
                  type: 'obs',
                  questionOptions: { rendering: 'number', concept: 'temperature-uuid' },
                },
              ],
            },
          ],
        },
      ],
    } as any;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FormCreationService,
        SingleSpaPropsService,
        {
          provide: FormDataSourceService,
          useValue: {
            getDataSources: () => ({
              location: {},
              provider: {},
              drug: {},
              problem: {},
              conceptAnswers: {},
              diagnoses: {},
              recentObs: () => Promise.resolve({}),
            }),
            getPatientObject: () => ({}),
          },
        },
        { provide: MonthlyScheduleResourceService, useValue: {} },
        {
          provide: ConfigResourceService,
          useValue: { getConfig: () => ({ dataSources: {}, customDataSources: [] }) },
        },
      ],
      imports: [FormEntryModule, TranslateModule.forRoot()],
    });

    singleSpaPropsSubject.next({
      patient: { id: 'patient-uuid' },
      patientUuid: 'patient-uuid',
      formUuid: 'form-uuid',
    } as any);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should reject values outside of the reference range which applies to the patient', async () => {
    const service: FormCreationService = TestBed.inject(FormCreationService);

    const form = await service.initAndCreateForm({
      formSchema: buildSchema(),
      session,
      patientIdentifiers: [],
      conceptReferenceRanges: new Map([
        ['temperature-uuid', { uuid: 'range-uuid', concept: 'temperature-uuid', lowAbsolute: 25, hiAbsolute: 43 }],
      ]),
    });

    const control = form.searchNodeByQuestionId('temperature')[0].control;

    control.setValue(50);
    expect(control.valid).toBe(false);

    control.setValue(20);
    expect(control.valid).toBe(false);

    control.setValue(37);
    expect(control.valid).toBe(true);
  });

  it('should leave the question unconstrained when the patient has no reference range', async () => {
    const service: FormCreationService = TestBed.inject(FormCreationService);

    const form = await service.initAndCreateForm({
      formSchema: buildSchema(),
      session,
      patientIdentifiers: [],
      conceptReferenceRanges: new Map(),
    });

    const control = form.searchNodeByQuestionId('temperature')[0].control;

    control.setValue(50);
    expect(control.valid).toBe(true);
  });
});
