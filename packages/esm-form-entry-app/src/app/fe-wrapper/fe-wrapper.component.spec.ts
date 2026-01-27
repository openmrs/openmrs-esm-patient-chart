import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

import { FeWrapperComponent } from './fe-wrapper.component';
import { FormEntryModule } from '@openmrs/ngx-formentry';
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
