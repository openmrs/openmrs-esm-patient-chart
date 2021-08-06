import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FeWrapperComponent } from './fe-wrapper.component';
import { FormEntryModule } from '@ampath-kenya/ngx-formentry';
import { ReactiveFormsModule } from '@angular/forms';
import { OpenmrsEsmApiService } from '../openmrs-api/openmrs-esm-api.service';
import { of } from 'rxjs';
import { FormSchemaService } from '../form-schema/form-schema.service';
import { OpenmrsApiModule } from '../openmrs-api/openmrs-api.module';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { FormDataSourceService } from '../form-data-source/form-data-source.service';
import { FormSubmissionService } from '../form-submission/form-submission.service';
import { FormSubmittedComponent } from '../form-submitted/form-submitted.component';

describe('FeWrapperComponent', () => {
  let component: FeWrapperComponent;
  let fixture: ComponentFixture<FeWrapperComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FeWrapperComponent, FormSubmittedComponent],
        imports: [BrowserModule, BrowserAnimationsModule, FormEntryModule, ReactiveFormsModule, OpenmrsApiModule],
        providers: [
          {
            provide: OpenmrsEsmApiService,
          },
          FormSchemaService,
          LocalStorageService,
          FormDataSourceService,
          FormSubmissionService,
        ],
        // schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(FeWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
