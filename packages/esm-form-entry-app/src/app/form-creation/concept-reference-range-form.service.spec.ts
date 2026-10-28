import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  AfeFormControl,
  ArrayNode,
  Form,
  FormEntryModule,
  FormFactory,
  GroupNode,
  NodeBase,
} from '@openmrs/ngx-formentry';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { of, Subject, Subscription } from 'rxjs';
import { ConceptReferenceRangeFormService } from './concept-reference-range-form.service';
import { ConceptReferenceRangeResourceService } from '../openmrs-api/concept-reference-range-resource.service';
import { ConceptReferenceRange } from '../types';

describe('Reference ranges at the measurement date', () => {
  let factory: FormFactory;
  let service: ConceptReferenceRangeFormService;
  let resource: jasmine.SpyObj<ConceptReferenceRangeResourceService>;
  let subscription: Subscription;
  const early = new Map<string, ConceptReferenceRange>([
    [
      'temperature-uuid',
      {
        uuid: 'early-range',
        concept: 'temperature-uuid',
        hiNormal: 35,
        hiAbsolute: 40,
      },
    ],
  ]);
  const later = new Map<string, ConceptReferenceRange>([
    [
      'temperature-uuid',
      {
        uuid: 'later-range',
        concept: 'temperature-uuid',
        hiNormal: 40,
        hiAbsolute: 50,
      },
    ],
  ]);

  function numericQuestion(id = 'temperature') {
    return {
      id,
      label: 'Temperature',
      type: 'obs',
      alert: { useConceptReferenceRange: true },
      questionOptions: { rendering: 'number', concept: 'temperature-uuid', min: '10' },
    };
  }

  function createForm(questions: unknown[] = [numericQuestion()], includeEncounterDate = true): Form {
    const form = factory.createForm({
      name: 'Vitals',
      pages: [
        {
          label: 'Vitals',
          sections: [
            {
              label: 'Vitals',
              isExpanded: 'true',
              questions: [
                ...(includeEncounterDate
                  ? [{ id: 'encDate', type: 'encounterDatetime', questionOptions: { rendering: 'date' } }]
                  : []),
                ...questions,
              ],
            },
          ],
        },
      ],
    });
    if (includeEncounterDate) {
      form.searchNodeByQuestionId('encDate')[0].control.setValue('2020-01-01T00:00:00Z');
    }
    return form;
  }

  function controlFor(form: Form, id = 'temperature', index = 0): AfeFormControl {
    return controlOf(form.searchNodeByQuestionId(id)[index]);
  }

  function controlOf(node: NodeBase): AfeFormControl {
    if (!(node.control instanceof AfeFormControl)) {
      throw new Error('Expected a numeric control');
    }
    return node.control;
  }

  function vitalsGroup(rendering = 'group') {
    return {
      id: 'vitals',
      label: 'Vitals',
      type: 'obsGroup',
      questionOptions: { rendering, concept: 'vitals-uuid' },
      questions: [
        numericQuestion(),
        { id: 'note', label: 'Note', type: 'obs', questionOptions: { rendering: 'text', concept: 'note-uuid' } },
      ],
    };
  }

  /**
   * Loads an obs group saved at the encounter date into a group node, the way the obs adapter does.
   */
  function loadSavedGroup(group: GroupNode, uuid: string, temperature: number) {
    const obsDatetime = '2020-01-01T00:00:00.000+0000';
    const temperatureObs = {
      uuid: `${uuid}-temperature`,
      concept: 'temperature-uuid',
      obsDatetime,
      value: temperature,
    };
    const noteObs = { uuid: `${uuid}-note`, concept: 'note-uuid', obsDatetime, value: 'Fine' };
    group.initialValue = { uuid, concept: 'vitals-uuid', obsDatetime, groupMembers: [temperatureObs, noteObs] };
    group.children['temperature'].initialValue = temperatureObs;
    group.children['temperature'].control.setValue(temperature);
    group.children['note'].initialValue = noteObs;
    group.children['note'].control.setValue(noteObs.value);
  }

  /**
   * Creates a form for an encounter saved on 2020-01-01 with a temperature of 37 recorded at the
   * encounter date, loaded the way the obs adapter loads saved answers.
   */
  function savedEncounterForm(showDate = false): Form {
    const measurement = numericQuestion();
    const form = createForm([
      showDate ? { ...measurement, questionOptions: { ...measurement.questionOptions, showDate: true } } : measurement,
    ]);
    const observation = { uuid: 'saved-obs', obsDatetime: '2020-01-01T00:00:00.000+0000', value: 37 };
    form.valueProcessingInfo.encounterUuid = 'saved-encounter';
    form.searchNodeByQuestionId('encDate')[0].initialValue = new Date('2020-01-01T00:00:00Z');
    form.searchNodeByQuestionId('temperature')[0].initialValue = observation;
    controlFor(form).setValue(observation.value);
    if (showDate) {
      form.searchNodeByQuestionId('complex_temperature')[0].initialValue = observation;
      const date = form.searchNodeByQuestionId('date_temperature')[0];
      date.initialValue = observation;
      date.control.setValue(observation.obsDatetime);
    }
    return form;
  }

  function lastContext() {
    return resource.getConceptReferenceRanges.calls.mostRecent().args[2];
  }

  beforeEach(() => {
    resource = jasmine.createSpyObj<ConceptReferenceRangeResourceService>('ranges', ['getConceptReferenceRanges']);
    resource.getConceptReferenceRanges.and.returnValue(of(early));
    TestBed.configureTestingModule({
      imports: [FormEntryModule, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConceptReferenceRangeResourceService, useValue: resource },
      ],
    });
    factory = TestBed.inject(FormFactory);
    service = TestBed.inject(ConceptReferenceRangeFormService);
  });

  afterEach(() => subscription?.unsubscribe());

  it('batches questions at the encounter date and refreshes when that date changes', fakeAsync(() => {
    const form = createForm([numericQuestion(), numericQuestion('anotherTemperature')]);
    const control = controlFor(form);
    control.setValue(45);
    subscription = service.connect(form, 'patient-uuid');
    expect(service.isLoading(form)).toBe(true);
    tick();
    expect(resource.getConceptReferenceRanges).toHaveBeenCalledOnceWith('patient-uuid', ['temperature-uuid'], {
      date: moment('2020-01-01T00:00:00Z').format(),
    });
    expect(control.valid).toBe(false);
    expect(control.alerts[0].shown).toBe(true);

    resource.getConceptReferenceRanges.and.returnValue(of(later));
    form.searchNodeByQuestionId('encDate')[0].control.setValue('2021-01-01T00:00:00Z');
    expect(service.isLoading(form)).toBe(true);
    tick();
    expect(resource.getConceptReferenceRanges.calls.mostRecent().args[2]).toEqual({
      date: moment('2021-01-01T00:00:00Z').format(),
    });
    expect(control.valid).toBe(true);
    control.setValue(5);
    expect(control.valid).toBe(false);
    expect(service.isLoading(form)).toBe(false);
  }));

  it('uses the observation context for a saved answer dated away from its encounter', fakeAsync(() => {
    const form = createForm();
    form.valueProcessingInfo.encounterUuid = 'historical-encounter';
    form.searchNodeByQuestionId('encDate')[0].initialValue = new Date('2020-01-01T00:00:00Z');
    form.searchNodeByQuestionId('temperature')[0].initialValue = {
      uuid: 'historical-obs',
      obsDatetime: '2019-06-01T00:00:00Z',
      value: 37,
    };
    subscription = service.connect(form, 'patient-uuid');
    tick();
    expect(resource.getConceptReferenceRanges).toHaveBeenCalledWith('patient-uuid', ['temperature-uuid'], {
      obs: 'historical-obs',
    });
  }));

  it('uses a saved encounter context until the encounter date is edited', fakeAsync(() => {
    const form = createForm();
    form.valueProcessingInfo.encounterUuid = 'historical-encounter';
    form.searchNodeByQuestionId('encDate')[0].initialValue = new Date('2020-01-01T00:00:00Z');
    subscription = service.connect(form, 'patient-uuid');
    tick();
    expect(resource.getConceptReferenceRanges.calls.mostRecent().args[2]).toEqual({
      encounter: 'historical-encounter',
    });
    form.searchNodeByQuestionId('encDate')[0].control.setValue('2021-01-01T00:00:00Z');
    tick();
    expect(resource.getConceptReferenceRanges.calls.mostRecent().args[2]).toEqual({
      date: moment('2021-01-01T00:00:00Z').format(),
    });
  }));

  it('batches unchanged saved answers under their encounter, even after the encounter date changes', fakeAsync(() => {
    const form = createForm([numericQuestion(), numericQuestion('anotherTemperature')]);
    form.valueProcessingInfo.encounterUuid = 'historical-encounter';
    form.searchNodeByQuestionId('encDate')[0].initialValue = new Date('2020-01-01T00:00:00Z');
    form.searchNodeByQuestionId('temperature')[0].initialValue = {
      uuid: 'first-obs',
      obsDatetime: '2020-01-01T00:00:00.000+0000',
      value: 37,
    };
    form.searchNodeByQuestionId('anotherTemperature')[0].initialValue = {
      uuid: 'second-obs',
      obsDatetime: '2020-01-01T00:00:00.000+0000',
      value: 38,
    };
    controlFor(form).setValue(37);
    controlFor(form, 'anotherTemperature').setValue(38);
    subscription = service.connect(form, 'patient-uuid');
    tick();
    expect(resource.getConceptReferenceRanges).toHaveBeenCalledOnceWith('patient-uuid', ['temperature-uuid'], {
      encounter: 'historical-encounter',
    });

    form.searchNodeByQuestionId('encDate')[0].control.setValue('2021-01-01T00:00:00Z');
    tick();
    expect(resource.getConceptReferenceRanges).toHaveBeenCalledTimes(2);
    expect(lastContext()).toEqual({ encounter: 'historical-encounter' });
  }));

  [
    { rendering: 'a plain answer', showDate: false },
    { rendering: 'an answer with its own date', showDate: true },
  ].forEach(({ rendering, showDate }) => {
    it(`keeps ${rendering} at its saved date until an edit sends it with a moved encounter`, fakeAsync(() => {
      const form = savedEncounterForm(showDate);
      const control = controlFor(form);
      subscription = service.connect(form, 'patient-uuid');
      tick();
      expect(lastContext()).toEqual({ encounter: 'saved-encounter' });

      // Without an encounter date change, an edited answer is still saved at the encounter date.
      control.setValue(38);
      tick();
      expect(resource.getConceptReferenceRanges).toHaveBeenCalledTimes(1);
      control.setValue(37);

      form.searchNodeByQuestionId('encDate')[0].control.setValue('2021-01-01T00:00:00Z');
      tick();
      expect(lastContext()).toEqual({ encounter: 'saved-encounter' });

      control.setValue(38);
      expect(service.isLoading(form)).toBe(true);
      tick();
      expect(lastContext()).toEqual({ date: moment('2021-01-01T00:00:00Z').format() });

      control.setValue(37);
      tick();
      expect(lastContext()).toEqual({ encounter: 'saved-encounter' });
    }));
  });

  it('moves an unchanged answer with its obs group when a sibling is edited', fakeAsync(() => {
    const form = createForm([vitalsGroup()]);
    form.valueProcessingInfo.encounterUuid = 'saved-encounter';
    form.searchNodeByQuestionId('encDate')[0].initialValue = new Date('2020-01-01T00:00:00Z');
    const group = form.searchNodeByQuestionId('vitals')[0];
    if (!(group instanceof GroupNode)) {
      throw new Error('Expected an obs group');
    }
    loadSavedGroup(group, 'saved-group', 37);
    subscription = service.connect(form, 'patient-uuid');
    tick();
    form.searchNodeByQuestionId('encDate')[0].control.setValue('2021-01-01T00:00:00Z');
    tick();
    expect(lastContext()).toEqual({ encounter: 'saved-encounter' });

    const note = form.searchNodeByQuestionId('note')[0].control;
    note.setValue('Feverish');
    expect(service.isLoading(form)).toBe(true);
    tick();
    expect(lastContext()).toEqual({ date: moment('2021-01-01T00:00:00Z').format() });

    note.setValue('Fine');
    tick();
    expect(lastContext()).toEqual({ encounter: 'saved-encounter' });
  }));

  it('moves only the repeated group whose sibling is edited', fakeAsync(() => {
    resource.getConceptReferenceRanges.and.callFake((_patient, _concepts, context) =>
      of(context?.date ? later : early),
    );
    const form = createForm([vitalsGroup('repeating')]);
    form.valueProcessingInfo.encounterUuid = 'saved-encounter';
    form.searchNodeByQuestionId('encDate')[0].initialValue = new Date('2020-01-01T00:00:00Z');
    const repeat = form.searchNodeByQuestionId('vitals')[0];
    if (!(repeat instanceof ArrayNode)) {
      throw new Error('Expected a repeating obs group');
    }
    const first = repeat.createChildNode();
    const second = repeat.createChildNode();
    loadSavedGroup(first, 'first-group', 37);
    loadSavedGroup(second, 'second-group', 38);
    subscription = service.connect(form, 'patient-uuid');
    tick();
    form.searchNodeByQuestionId('encDate')[0].control.setValue('2021-01-01T00:00:00Z');
    tick();
    expect(controlOf(first.children['temperature']).conceptReferenceRange).toBe(early.get('temperature-uuid'));

    first.children['note'].control.setValue('Feverish');
    tick();
    expect(controlOf(first.children['temperature']).conceptReferenceRange).toBe(later.get('temperature-uuid'));
    expect(controlOf(second.children['temperature']).conceptReferenceRange).toBe(early.get('temperature-uuid'));
  }));

  it('falls back to the encounter date when a separately dated answer has no date yet', fakeAsync(() => {
    const measurement = numericQuestion();
    const form = createForm([
      {
        ...measurement,
        questionOptions: { ...measurement.questionOptions, showDate: true },
      },
    ]);
    const control = controlFor(form);
    control.setValue(45);
    subscription = service.connect(form, 'patient-uuid');
    tick();
    expect(resource.getConceptReferenceRanges).toHaveBeenCalledOnceWith('patient-uuid', ['temperature-uuid'], {
      date: moment('2020-01-01T00:00:00Z').format(),
    });
    expect(control.valid).toBe(false);

    form.searchNodeByQuestionId('date_temperature')[0].control.setValue(new Date(Number.NaN));
    tick();
    expect(resource.getConceptReferenceRanges.calls.mostRecent().args[2]).toEqual({
      date: moment('2020-01-01T00:00:00Z').format(),
    });
    expect(control.valid).toBe(false);
  }));

  it('keeps ranges at the date the encounter will be saved with while its date is blank or invalid', fakeAsync(() => {
    const form = createForm();
    const control = controlFor(form);
    const encounterDate = form.searchNodeByQuestionId('encDate')[0].control;
    subscription = service.connect(form, 'patient-uuid');
    tick();
    encounterDate.setValue(new Date(Number.NaN));
    tick();
    const context = resource.getConceptReferenceRanges.calls.mostRecent().args[2];
    expect(Math.abs(moment().diff(context.date, 'seconds'))).toBeLessThan(5);
    expect(control.conceptReferenceRange).toBe(early.get('temperature-uuid'));

    form.valueProcessingInfo.encounterUuid = 'historical-encounter';
    encounterDate.setValue('');
    tick();
    expect(resource.getConceptReferenceRanges.calls.mostRecent().args[2]).toEqual({
      encounter: 'historical-encounter',
    });
    expect(control.conceptReferenceRange).toBe(early.get('temperature-uuid'));
  }));

  it('uses the saved encounter when the form has no encounter-date question', fakeAsync(() => {
    const form = createForm([numericQuestion()], false);
    form.valueProcessingInfo.encounterUuid = 'historical-encounter';
    subscription = service.connect(form, 'patient-uuid');
    tick();
    expect(resource.getConceptReferenceRanges.calls.mostRecent().args[2]).toEqual({
      encounter: 'historical-encounter',
    });
  }));

  it('refreshes a separately dated observation when its measurement date is edited', fakeAsync(() => {
    const measurement = numericQuestion();
    const form = createForm([
      {
        ...measurement,
        questionOptions: { ...measurement.questionOptions, showDate: true },
      },
    ]);
    const observation = { uuid: 'historical-obs', obsDatetime: '2019-01-01T00:00:00Z', value: 37 };
    form.searchNodeByQuestionId('complex_temperature')[0].initialValue = observation;
    form.searchNodeByQuestionId('temperature')[0].initialValue = observation;
    controlFor(form).setValue(observation.value);
    const date = form.searchNodeByQuestionId('date_temperature')[0].control;
    date.setValue(observation.obsDatetime);
    subscription = service.connect(form, 'patient-uuid');
    tick();
    expect(resource.getConceptReferenceRanges.calls.mostRecent().args[2]).toEqual({ obs: 'historical-obs' });
    date.setValue('2018-01-01T00:00:00Z');
    tick();
    expect(resource.getConceptReferenceRanges.calls.mostRecent().args[2]).toEqual({
      date: moment('2018-01-01T00:00:00Z').format(),
    });
  }));

  it('cancels stale responses and keeps submission pending even when a numeric answer changes', fakeAsync(() => {
    const first = new Subject<Map<string, ConceptReferenceRange>>();
    const second = new Subject<Map<string, ConceptReferenceRange>>();
    resource.getConceptReferenceRanges.and.returnValues(first, second);
    const form = createForm();
    const control = controlFor(form);
    subscription = service.connect(form, 'patient-uuid');
    tick();
    form.searchNodeByQuestionId('encDate')[0].control.setValue('2021-01-01T00:00:00Z');
    first.next(early);
    first.complete();
    expect(service.isLoading(form)).toBe(true);
    expect(control.conceptReferenceRange).toBeUndefined();
    tick();
    control.setValue(45);
    expect(service.isLoading(form)).toBe(true);
    second.next(later);
    second.complete();
    expect(service.isLoading(form)).toBe(false);
    expect(control.valid).toBe(true);
  }));

  it('reports when pending ranges finish loading', fakeAsync(() => {
    const response = new Subject<Map<string, ConceptReferenceRange>>();
    resource.getConceptReferenceRanges.and.returnValue(response);
    const form = createForm();
    subscription = service.connect(form, 'patient-uuid');
    let loaded = false;
    service.whenLoaded(form).subscribe(() => (loaded = true));
    tick();
    expect(loaded).toBe(false);

    response.next(early);
    response.complete();
    expect(loaded).toBe(true);

    let loadedAgain = false;
    service.whenLoaded(form).subscribe(() => (loadedAgain = true));
    expect(loadedAgain).toBe(true);
  }));

  it('keeps schema validation when the server returns no range', fakeAsync(() => {
    resource.getConceptReferenceRanges.and.returnValue(of(new Map()));
    const form = createForm();
    subscription = service.connect(form, 'patient-uuid');
    tick();
    const control = controlFor(form);
    control.setValue(5);
    expect(control.valid).toBe(false);
    expect(control.alerts[0].shown).toBe(false);
    expect(service.isLoading(form)).toBe(false);
  }));

  it('loads ranges for newly added repeated questions and stops listening when disconnected', fakeAsync(() => {
    const form = createForm([
      {
        id: 'repeat',
        type: 'obsGroup',
        questionOptions: { rendering: 'repeating' },
        questions: [numericQuestion()],
      },
    ]);
    subscription = service.connect(form, 'patient-uuid');
    tick();
    expect(resource.getConceptReferenceRanges).not.toHaveBeenCalled();
    form.searchNodeByQuestionId('repeat')[0].createChildNode();
    tick();
    expect(controlFor(form).conceptReferenceRange).toBe(early.get('temperature-uuid'));
    subscription.unsubscribe();
    resource.getConceptReferenceRanges.calls.reset();
    form.searchNodeByQuestionId('encDate')[0].control.setValue('2021-01-01T00:00:00Z');
    tick();
    expect(resource.getConceptReferenceRanges).not.toHaveBeenCalled();
  }));
});
