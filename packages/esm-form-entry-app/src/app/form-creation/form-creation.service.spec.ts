import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';

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

describe('Service: FormCreationService, z-score references', () => {
  const session: any = {
    sessionLocation: { uuid: 'location-uuid' },
    currentProvider: { uuid: 'provider-uuid' },
  };

  function numberQuestion(id: string, calculateExpression?: string) {
    return {
      label: id,
      id,
      type: 'obs',
      questionOptions: {
        rendering: 'number',
        concept: `${id}-uuid`,
        ...(calculateExpression && { calculate: { calculateExpression } }),
      },
    };
  }

  // The z-score questions from AMPATH's POC Triage Encounter Form v1.5
  function buildSchema() {
    return {
      uuid: 'form-uuid',
      display: 'Triage',
      encounterType: { uuid: 'type-uuid', display: 'Triage' },
      pages: [
        {
          label: 'Triage',
          sections: [
            {
              label: 'Growth',
              isExpanded: 'true',
              questions: [
                numberQuestion('height'),
                numberQuestion('weight'),
                numberQuestion('weightScore', 'calcWeightForHeightZscore(weightForHeightRef,height,weight)'),
                numberQuestion('heightLengthScore', 'calcHeightForAgeZscore(heightForAgeRef,height,weight)'),
                numberQuestion(
                  'bmiScore',
                  "!isEmpty(height) && !isEmpty(weight) ? calcBMIForAgeZscore(bmiForAgeRef,height,weight): ''",
                ),
              ],
            },
          ],
        },
      ],
    } as any;
  }

  let patientObject: any;

  function setPatient(sex: string, birthDate: string) {
    patientObject = { sex };
    singleSpaPropsSubject.next({
      patient: { id: 'patient-uuid', birthDate },
      patientUuid: 'patient-uuid',
      formUuid: 'form-uuid',
    } as any);
  }

  async function calculateScores(height: number, weight: number) {
    const service: FormCreationService = TestBed.inject(FormCreationService);
    const form = await service.initAndCreateForm({ formSchema: buildSchema(), session, patientIdentifiers: [] });
    const control = (id: string) => form.searchNodeByQuestionId(id)[0].control;

    control('height').setValue(height);
    control('weight').setValue(weight);

    return {
      weightScore: control('weightScore').value,
      heightLengthScore: control('heightLengthScore').value,
      bmiScore: control('bmiScore').value,
    };
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
            getPatientObject: () => patientObject,
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
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should calculate weight-for-height and height-for-age z-scores for a child under 5', async () => {
    setPatient('F', moment().subtract(3, 'years').subtract(40, 'days').format('YYYY-MM-DD'));

    expect(await calculateScores(95, 14)).toEqual({ weightScore: '0', heightLengthScore: '-1', bmiScore: null });
  });

  it('should calculate height-for-age and BMI-for-age z-scores for a child aged 5 to 17', async () => {
    setPatient('M', moment().subtract(8, 'years').subtract(40, 'days').format('YYYY-MM-DD'));

    const { heightLengthScore, bmiScore } = await calculateScores(130, 28);

    expect(heightLengthScore).toBe('0');
    expect(bmiScore).toBe('0');
  });

  it("should calculate height-for-age against the girls' reference for a girl aged 5 to 17", async () => {
    setPatient('F', moment().subtract(15, 'years').subtract(40, 'days').format('YYYY-MM-DD'));

    const { heightLengthScore } = await calculateScores(160, 50);

    expect(heightLengthScore).toBe('-1');
  });

  it('should not register the WHO reference data for a form that does not use it', async () => {
    setPatient('F', '2023-08-27');
    const service: FormCreationService = TestBed.inject(FormCreationService);
    const dataSources: DataSources = TestBed.inject(DataSources);
    const schema = buildSchema();
    schema.pages[0].sections[0].questions = [numberQuestion('height'), numberQuestion('weight')];

    await service.initAndCreateForm({ formSchema: schema, session, patientIdentifiers: [] });

    expect(Object.keys(dataSources.dataSources)).not.toContain('weightForHeightRef');
    expect(Object.keys(dataSources.dataSources)).not.toContain('heightForAgeRef');
    expect(Object.keys(dataSources.dataSources)).not.toContain('bmiForAgeRef');
  });
});
