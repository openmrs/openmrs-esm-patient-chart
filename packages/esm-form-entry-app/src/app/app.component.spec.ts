import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { FeWrapperComponent } from './fe-wrapper/fe-wrapper.component';
import { FormEntryModule } from '@openmrs/ngx-formentry';
import { ReactiveFormsModule } from '@angular/forms';
import { FormSchemaService } from './form-schema/form-schema.service';
import { OpenmrsApiModule } from './openmrs-api/openmrs-api.module';
import { LocalStorageService } from './local-storage/local-storage.service';
import { FormDataSourceService } from './form-data-source/form-data-source.service';
import { FormSubmissionService } from './form-submission/form-submission.service';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormEntryModule, ReactiveFormsModule, OpenmrsApiModule],
      declarations: [AppComponent, FeWrapperComponent],
      providers: [FormSchemaService, LocalStorageService, FormDataSourceService, FormSubmissionService],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
