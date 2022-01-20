import * as moment from 'moment';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  QuestionFactory,
  FormFactory,
  ObsValueAdapter,
  OrderValueAdapter,
  EncounterAdapter,
  DataSources,
  FormErrorsService,
  Form,
} from '@ampath-kenya/ngx-formentry';
import { Observable, forkJoin, ReplaySubject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { OpenmrsEsmApiService } from '../openmrs-api/openmrs-esm-api.service';
import { FormSchemaService } from '../form-schema/form-schema.service';
import { FormDataSourceService } from '../form-data-source/form-data-source.service';
import { FormSubmissionService } from '../form-submission/form-submission.service';
import { EncounterResourceService } from '../openmrs-api/encounter-resource.service';
import { singleSpaPropsSubject, SingleSpaProps } from '../../single-spa-props';
import { Encounter, FormEntryConfig, FormSchema, LoggedInUser, Order } from '../types';
// @ts-ignore
import { showToast, detach, showNotification } from '@openmrs/esm-framework';
import { PatientPreviousEncounterService } from '../openmrs-api/patient-previous-encounter.service';

import { MonthlyScheduleResourceService } from '../services/monthly-scheduled-resource.service';
import { ConfigResourceService } from '../services/config-resource.service';
@Component({
  selector: 'my-app-fe-wrapper',
  templateUrl: './fe-wrapper.component.html',
  styleUrls: ['./fe-wrapper.component.css'],
})
export class FeWrapperComponent implements OnInit {
  data: any;
  sections: {} = {};
  formGroup: FormGroup;
  activeTab = 0;
  form: Form;
  formName: string;
  formUuid: string;
  encounterUuid: string;
  visitUuid: string;
  encounter: Encounter;
  formSchema: FormSchema;
  patient: any;
  loadingError: string;
  formSubmitted = false;
  singleSpaProps: SingleSpaProps;
  loggedInUser: LoggedInUser;
  triedSubmitting = false;
  errorPanelOpen = false;
  submittedOrder: Array<Order> = [];
  prevEncounter: Encounter;
  isLoading: boolean = true;
  config: FormEntryConfig;

  public get encounterDate(): string {
    return moment(this.encounter.encounterDatetime).format('YYYY-MM-DD');
  }

  public get encounterTime(): string {
    return moment(this.encounter.encounterDatetime).format('HH:mm');
  }

  public get hasValidationErrors(): boolean {
    return this.triedSubmitting && this.form && !this.form.valid;
  }

  constructor(
    private openmrsApi: OpenmrsEsmApiService,
    private formSchemaService: FormSchemaService,
    private encounterResourceService: EncounterResourceService,
    private questionFactory: QuestionFactory,
    private formFactory: FormFactory,
    private obsValueAdapater: ObsValueAdapter,
    private orderAdaptor: OrderValueAdapter,
    private encAdapter: EncounterAdapter,
    private dataSources: DataSources,
    private formDataSourceService: FormDataSourceService,
    private formSubmissionService: FormSubmissionService,
    private formErrorsService: FormErrorsService,
    private patientPreviousEncounter: PatientPreviousEncounterService,
    private monthlyScheduleResourceService: MonthlyScheduleResourceService,
    private configResourceService: ConfigResourceService,
  ) {}

  ngOnInit() {
    this.config = this.configResourceService.getConfig();
    this.launchForm().subscribe(
      (form) => {
        // console.log('Form loaded and rendered', form);
        this.isLoading = false;
      },
      (err) => {
        // TODO: Handle errors
        console.error('Error rendering form', err);
        this.loadingError = 'Error loading form';
        this.isLoading = false;
      },
    );
  }

  public displayLabOrdersNotification() {
    const orders =
      this.submittedOrder.map((order, index) => ` ${index + 1} : ${order.display} : ${order.orderNumber}`).join() ?? '';
    if (orders.length) {
      showNotification({
        title: 'Lab order(s) generated',
        kind: 'success',
        critical: true,
        description: orders,
      });
    }
  }

  public onSubmit(event: any) {
    if (this.isFormValid()) {
      this.saveForm().subscribe(
        (response) => {
          this.encounterUuid = response[0] && response[0].uuid;
          if (this.encounterUuid) {
            this.encounterResourceService
              .getEncounterByUuid(this.encounterUuid)
              .pipe(take(1))
              .subscribe((encounter) => {
                if (encounter && encounter.orders) {
                  this.submittedOrder = encounter.orders.filter(({ auditInfo }) => !auditInfo.dateVoided);
                  this.displayLabOrdersNotification();
                }
              });
            showToast({
              critical: true,
              kind: 'success',
              description: `The form has been submitted successfully`,
              title: this.formName,
            });
            this.closeForm();
          }
        },
        (error) => {
          console.error('Error submitting form', error);
          detach('patient-chart-workspace-slot', 'patient-form-entry-workspace');
          showToast({
            critical: true,
            kind: 'error',
            description: `An error has occurred while submitting the form ${JSON.stringify(error, null, 2)}`,
            title: this.formName,
          });
        },
      );
    } else {
      this.triedSubmitting = true;
      this.form.showErrors = true;
      setTimeout(() => {
        this.errorPanelOpen = true;
      }, 10);
    }
  }

  public closeForm() {
    detach('patient-chart-workspace-slot', 'patient-form-entry-workspace');
  }

  public onEditSaved() {
    this.singleSpaProps.encounterUuid = this.encounterUuid;
    singleSpaPropsSubject.next(this.singleSpaProps);
    this.resetVariables();
    this.ngOnInit();
  }

  public onExpandCollapseErrorPanel($event) {
    this.errorPanelOpen = !this.errorPanelOpen;
  }

  public onErrorPanelLostFocus() {
    this.errorPanelOpen = false;
  }

  public resetVariables() {
    this.data = undefined;
    this.sections = {};
    this.formGroup = undefined;
    this.activeTab = 0;
    this.form = undefined;
    this.formName = undefined;
    this.formUuid = undefined;
    this.encounterUuid = undefined;
    this.encounter = undefined;
    this.formSchema = undefined;
    this.patient = undefined;
    this.loadingError = undefined;
    this.formSubmitted = false;
    this.singleSpaProps = undefined;
  }

  public getProps(): Observable<SingleSpaProps> {
    const subject = new ReplaySubject<SingleSpaProps>(1);
    singleSpaPropsSubject.pipe(take(1)).subscribe(
      (props) => {
        this.singleSpaProps = props;
        const formUuid = props.formUuid;
        if (!(formUuid && typeof formUuid === 'string')) {
          subject.error('Form UUID is required. props.formUuid missing');
          return;
        }
        subject.next(props);
      },
      (err) => {
        subject.error(err);
      },
    );
    return subject.asObservable();
  }

  private setUpWHOCascading() {
    try {
      if (this.form) {
        let whoQuestions = this.form.searchNodeByQuestionId('adultWhoStage');

        if (whoQuestions.length === 0) {
          whoQuestions = this.form.searchNodeByQuestionId('pedWhoStage');
        }

        const whoStageQuestion = whoQuestions[0];

        whoStageQuestion?.control.valueChanges.subscribe((val) => {
          if (val && val !== '') {
            const source = this.form.dataSourcesContainer.dataSources['conceptAnswers'];
            if (source.changeConcept) {
              source.changeConcept(val);
            }
          }
        });
      }
    } catch (error) {
      console.error(`Error setting up Who Staging Cascading, ${error}`);
    }
  }

  private loadPatientPreviousEncounters(data, subject) {
    this.patientPreviousEncounter
      .getPreviousEncounter(data.formSchema.encounterType?.uuid, this.singleSpaProps.patient.id)
      .then((prevEnc) => {
        this.prevEncounter = prevEnc ? prevEnc : Object.create({});
        this.createForm();
        subject.next(this.form);
      });
  }

  public launchForm(): Observable<Form> {
    const subject = new ReplaySubject<Form>(1);
    const loadForm = () => {
      this.loadAllFormDependencies()
        .pipe(take(1))
        .subscribe(
          (data) => {
            if (this.singleSpaProps.isOffline) {
              this.loadPatientPreviousEncounters(data, subject);
            } else {
              this.createForm();
              subject.next(this.form);
            }
          },
          (err) => {
            subject.error(err);
          },
        );
    };

    this.getProps()
      .pipe(take(1))
      .subscribe(
        (props) => {
          this.formUuid = props.formUuid;
          this.patient = props.patient;
          if (props.encounterUuid) {
            this.encounterUuid = props.encounterUuid;
          }
          if (props.visitUuid && !this.encounterUuid) {
            this.visitUuid = props.visitUuid;
          }
          loadForm();
        },
        (err) => {
          subject.error(err);
        },
      );

    return subject.asObservable();
  }

  private loadAllFormDependencies(): Observable<any> {
    const trackingSubject = new ReplaySubject<any>(1);
    const observableBatch: Array<Observable<any>> = [];
    observableBatch.push(this.fetchCompiledFormSchema(this.formUuid).pipe(take(1)));
    observableBatch.push(this.openmrsApi.getCurrentUserLocation().pipe(take(1)));
    if (this.encounterUuid) {
      observableBatch.push(this.getEncounterToEdit(this.encounterUuid).pipe(take(1)));
    }
    forkJoin(observableBatch).subscribe(
      (data) => {
        this.formSchema = data[0] || null;
        this.loggedInUser = data[1] || null;
        this.encounter = data[2] || null;
        const formData = {
          formSchema: data[0],
          patient: this.patient,
          user: data[1],
          encounter: data.length === 4 ? data[2] : null,
        };
        trackingSubject.next(formData);
      },
      (err) => {
        trackingSubject.error(new Error('There was an error fetching form data. Details: ' + err));
      },
    );

    return trackingSubject.asObservable();
  }

  private fetchCompiledFormSchema(uuid: string): Observable<FormSchema> {
    const subject = new ReplaySubject<FormSchema>(1);
    this.formSchemaService
      .getFormSchemaByUuid(uuid, true)
      .pipe(take(1))
      .subscribe(
        (formSchema) => {
          subject.next(formSchema);
        },
        (error) => {
          subject.error(new Error('Error fetching form schema. Details: ' + error));
        },
      );
    return subject.asObservable();
  }

  private getEncounterToEdit(encounterUuid: string): Observable<Encounter> {
    const subject = new ReplaySubject<Encounter>(1);
    const sub: Subscription = this.encounterResourceService.getEncounterByUuid(encounterUuid).subscribe(
      (encounter) => {
        subject.next(encounter);
        sub.unsubscribe();
      },
      (error) => {
        subject.error(error);
        sub.unsubscribe();
      },
    );
    return subject.asObservable();
  }

  private createForm() {
    this.wireDataSources();
    this.formName = this.formSchema.name;
    this.form = this.formFactory.createForm(this.formSchema, this.dataSources.dataSources);
    this.setUpWHOCascading();
    if (this.encounter) {
      this.populateEncounterForEditing();
      this.form.valueProcessingInfo.encounterUuid = this.singleSpaProps.encounterUuid;
    } else {
      this.form.valueProcessingInfo.patientUuid = this.singleSpaProps.patient.id;
      this.setDefaultValues();
    }
    this.setUpPayloadProcessingInformation();
  }

  private wireDataSources() {
    this.registerConfigurableDataSources();
    this.dataSources.registerDataSource('location', this.formDataSourceService.getDataSources().location);
    this.dataSources.registerDataSource('provider', this.formDataSourceService.getDataSources().provider);
    this.dataSources.registerDataSource('drug', this.formDataSourceService.getDataSources().drug);
    this.dataSources.registerDataSource('problem', this.formDataSourceService.getDataSources().problem);
    this.dataSources.registerDataSource('personAttribute', this.formDataSourceService.getDataSources().location);
    this.dataSources.registerDataSource('conceptAnswers', this.formDataSourceService.getDataSources().conceptAnswers);
    this.dataSources.registerDataSource('patient', { visitTypeUuid: this.singleSpaProps.visitTypeUuid }, true);
    this.dataSources.registerDataSource('patient', this.formDataSourceService.getPatientObject(this.patient), true);
    this.dataSources.registerDataSource('rawPrevEnc', this.prevEncounter, false);
    this.dataSources.registerDataSource('userLocation', this.loggedInUser.sessionLocation);
  }

  private setDefaultValues() {
    // encounter date and time
    const currentDate = moment().format();
    const encounterDate = this.form.searchNodeByQuestionId('encDate');
    if (encounterDate.length > 0) {
      encounterDate[0].control.setValue(currentDate);
    }

    // location
    const encounterLocation = this.form.searchNodeByQuestionId('location', 'encounterLocation');
    if (encounterLocation.length > 0 && this.loggedInUser && this.loggedInUser.sessionLocation) {
      // const location = { value: this.loggedInUser.sessionLocation.uuid, label: this.loggedInUser.sessionLocation.display };
      encounterLocation[0].control.setValue(this.loggedInUser.sessionLocation.uuid);
    }

    // provider
    const encounterProvider = this.form.searchNodeByQuestionId('provider', 'encounterProvider');
    if (encounterProvider.length > 0 && this.loggedInUser && this.loggedInUser.currentProvider) {
      encounterProvider[0].control.setValue(this.loggedInUser.currentProvider.uuid);
    }
  }

  private setUpPayloadProcessingInformation() {
    try {
      if (this.loggedInUser) {
        this.form.valueProcessingInfo.personUuid = this.patient.id;
        this.form.valueProcessingInfo.patientUuid = this.patient.id;
        this.form.valueProcessingInfo.formUuid = this.formSchema.uuid;
        this.form.valueProcessingInfo.providerUuid = this.loggedInUser?.currentProvider?.uuid;
        if (this.formSchema.encounterType) {
          this.form.valueProcessingInfo.encounterTypeUuid = this.formSchema.encounterType.uuid;
        } else {
          this.isLoading = false;
          throw new Error('Please associate the form with an encounter type.');
        }
        if (this.encounterUuid) {
          this.form.valueProcessingInfo.encounterUuid = this.encounterUuid;
        }
        if (this.visitUuid) {
          this.form.valueProcessingInfo.visitUuid = this.visitUuid;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  private populateEncounterForEditing() {
    if (this.encounter) {
      this.encAdapter.populateForm(this.form, this.encounter);
    }
  }

  // check validity of form
  private isFormValid(): boolean {
    if (!this.form.valid) {
      this.form.markInvalidControls(this.form.rootNode);
    }
    return this.form.valid;
  }

  private saveForm(): Observable<any> {
    return this.formSubmissionService.submitPayload(this.form);
  }

  private registerConfigurableDataSources() {
    const { dataSources } = this.config;
    if (dataSources.monthlySchedule) {
      this.dataSources.registerDataSource('monthlyScheduleResourceService', this.monthlyScheduleResourceService);
    }
  }
}
