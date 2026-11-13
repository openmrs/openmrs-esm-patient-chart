import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

import { FeWrapperComponent } from './fe-wrapper.component';
import { Form, FormEntryModule, FormFactory } from '@openmrs/ngx-formentry';
import { ReactiveFormsModule } from '@angular/forms';
import { OpenmrsEsmApiService } from '../openmrs-api/openmrs-esm-api.service';
import { FormSchemaService } from '../form-schema/form-schema.service';
import { OpenmrsApiModule } from '../openmrs-api/openmrs-api.module';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { FormDataSourceService } from '../form-data-source/form-data-source.service';
import { FormSubmissionService } from '../form-submission/form-submission.service';
import { SingleSpaPropsService } from '../single-spa-props/single-spa-props.service';
import { VisitResourceService } from '../openmrs-api/visit-resource.service';
import { PatientResourceService } from '../openmrs-api/patient-resource.service';
import { ConfigResourceService } from '../services/config-resource.service';
import { FormCreationService } from '../form-creation/form-creation.service';
import { ConceptReferenceRangeFormService } from '../form-creation/concept-reference-range-form.service';

describe('FeWrapperComponent', () => {
  let component: FeWrapperComponent;
  let fixture: ComponentFixture<FeWrapperComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FeWrapperComponent],
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormEntryModule,
        ReactiveFormsModule,
        OpenmrsApiModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        OpenmrsEsmApiService,
        FormSchemaService,
        LocalStorageService,
        FormDataSourceService,
        FormSubmissionService,
        SingleSpaPropsService,
        VisitResourceService,
        PatientResourceService,
        ConfigResourceService,
        FormCreationService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // TODO: This test needs many more providers - skip for now
  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('FeWrapperComponent submission while reference ranges load', () => {
  let form: Form;
  let loading: boolean;
  let loaded: Subject<void>;
  let formSubmission: jasmine.SpyObj<FormSubmissionService>;
  let component: FeWrapperComponent;
  let changeState: jasmine.Spy;
  let originalI18next: typeof window.i18next;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormEntryModule, TranslateModule.forRoot()],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    form = TestBed.inject(FormFactory).createForm({
      name: 'Vitals',
      pages: [
        {
          label: 'Vitals',
          sections: [
            {
              label: 'Vitals',
              isExpanded: 'true',
              questions: [
                {
                  id: 'temperature',
                  label: 'Temperature',
                  type: 'obs',
                  required: 'true',
                  questionOptions: { rendering: 'number', concept: 'temperature-uuid' },
                },
              ],
            },
          ],
        },
      ],
    });

    originalI18next = window.i18next;
    window.i18next = { language: 'en' } as typeof window.i18next;

    loading = true;
    loaded = new Subject<void>();
    const referenceRanges = jasmine.createSpyObj<ConceptReferenceRangeFormService>('referenceRanges', [
      'isLoading',
      'whenLoaded',
    ]);
    referenceRanges.isLoading.and.callFake(() => loading);
    referenceRanges.whenLoaded.and.callFake(() => loaded.pipe(take(1)));
    formSubmission = jasmine.createSpyObj<FormSubmissionService>('formSubmission', ['buildEncounterPayload']);
    const singleSpaProps = jasmine.createSpyObj<SingleSpaPropsService>('singleSpaProps', ['getProp']);

    // Only the services that submission touches are needed.
    component = new FeWrapperComponent(
      null,
      null,
      null,
      formSubmission,
      null,
      null,
      singleSpaProps,
      null,
      null,
      null,
      null,
      null,
      null,
      referenceRanges,
    );
    component.form = form;
    changeState = spyOn<any>(component, 'changeState').and.callThrough();
  });

  afterEach(() => {
    window.i18next = originalI18next;
  });

  it('shows the submitting state and validates once the reference ranges finish loading', () => {
    component.onSubmit();
    expect(changeState.calls.allArgs()).toEqual([['submitting']]);
    expect(form.showErrors).toBeFalsy();

    loading = false;
    loaded.next();
    expect(changeState.calls.allArgs()).toEqual([['submitting'], ['initial'], ['readyWithValidationErrors']]);
    expect(form.showErrors).toBe(true);
    expect(formSubmission.buildEncounterPayload).not.toHaveBeenCalled();
  });

  it('ignores another submission while one waits for the reference ranges', () => {
    component.onSubmit();
    component.onSubmit();
    expect(changeState.calls.allArgs()).toEqual([['submitting']]);

    loading = false;
    loaded.next();
    expect(changeState.calls.allArgs()).toEqual([['submitting'], ['initial'], ['readyWithValidationErrors']]);

    loading = true;
    component.onSubmit();
    expect(changeState.calls.mostRecent().args).toEqual(['submitting']);
  });

  it('drops a pending submission when the form is destroyed', () => {
    component.onSubmit();
    component.ngOnDestroy();

    loading = false;
    loaded.next();
    expect(changeState.calls.allArgs()).toEqual([['submitting']]);
    expect(form.showErrors).toBeFalsy();
  });
});
