import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormSubmittedComponent } from './form-submitted.component';

describe('FormSubmittedComponent', () => {
  let component: FormSubmittedComponent;
  let fixture: ComponentFixture<FormSubmittedComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FormSubmittedComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(FormSubmittedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
