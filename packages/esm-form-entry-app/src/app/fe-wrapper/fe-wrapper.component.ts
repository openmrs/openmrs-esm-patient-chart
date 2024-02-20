import { NgZone, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { Form } from '@openmrs/ngx-formentry';
import { Observable, forkJoin, from, throwError, of, Subscription } from 'rxjs';
import { catchError, concatAll, map, mergeMap, take } from 'rxjs/operators';
import { OpenmrsEsmApiService } from '../openmrs-api/openmrs-esm-api.service';
import { FormSchemaService } from '../form-schema/form-schema.service';
import { FormSubmissionService } from '../form-submission/form-submission.service';
import { EncounterResourceService } from '../openmrs-api/encounter-resource.service';
import { Encounter, EncounterCreate, FormSchema, Identifier, Order } from '../types';
import { showSnackbar, getSynchronizationItems, createGlobalStore, showModal } from '@openmrs/esm-framework';

import { PatientPreviousEncounterService } from '../openmrs-api/patient-previous-encounter.service';

import { patientFormSyncItem, PatientFormSyncItemContent } from '../offline/sync';
import { SingleSpaPropsService } from '../single-spa-props/single-spa-props.service';
import { CreateFormParams, FormCreationService } from '../form-creation/form-creation.service';
import { TranslateService } from '@ngx-translate/core';
import { ProgramResourceService } from '../openmrs-api/program-resource.service';
import { FormDataSourceService } from '../form-data-source/form-data-source.service';
import { PatientResourceService } from '../openmrs-api/patient-resource.service';
import { VisitResourceService } from '../openmrs-api/visit-resource.service';

type FormState =
  | 'initial'
  | 'loading'
  | 'loadingError'
  | 'ready'
  | 'readyWithValidationErrors'
  | 'submitting'
  | 'submitted'
  | 'submissionError';

const store = createGlobalStore<Record<string, FormState>>('ampath-form-state', {});

@Component({
  selector: 'my-app-fe-wrapper',
  templateUrl: './fe-wrapper.component.html',
  styleUrls: ['./fe-wrapper.component.scss'],
})
export class FeWrapperComponent implements OnInit, OnDestroy {
  private launchFormSubscription?: Subscription;
  private unsubscribeStore: () => void | undefined;

  public formUuid: string;
  public form: Form;
  public loadingError?: string;
  public labelMap: Record<string, string> = {};
  public formState: FormState = 'initial';
  public showDiscardSubmitButtons: boolean = true;
  public language: string = (window as any).i18next.language.substring(0, 2).toLowerCase();

  public constructor(
    private readonly openmrsApi: OpenmrsEsmApiService,
    private readonly formSchemaService: FormSchemaService,
    private readonly encounterResourceService: EncounterResourceService,
    private readonly formSubmissionService: FormSubmissionService,
    private readonly patientPreviousEncounter: PatientPreviousEncounterService,
    private readonly formCreationService: FormCreationService,
    private readonly singleSpaPropsService: SingleSpaPropsService,
    private readonly translateService: TranslateService,
    private readonly ngZone: NgZone,
    private readonly programService: ProgramResourceService,
    private readonly formDataSourceService: FormDataSourceService,
    private readonly patientResourceService: PatientResourceService,
    private readonly visitResourceService: VisitResourceService,
  ) {}

  public ngOnInit() {
    this.unsubscribeStore = store.subscribe((value) => {
      this.formState = value[this.formUuid];
    });
    this.changeState('initial');
    this.launchForm();
  }

  public ngOnDestroy() {
    this.unsubscribeStore && this.unsubscribeStore();
    this.launchFormSubscription?.unsubscribe();
  }

  public launchForm() {
    const language = window.i18next?.language?.substring(0, 2) ?? '';
    this.translateService.addLangs([language]);
    this.translateService.use(language);

    this.changeState('loading');
    this.showDiscardSubmitButtons = this.singleSpaPropsService.getProp('showDiscardSubmitButtons') ?? true;
    this.launchFormSubscription?.unsubscribe();
    this.launchFormSubscription = this.loadAllFormDependencies()
      .pipe(
        take(1),
        map((createFormParams) => from(this.formCreationService.initAndCreateForm(createFormParams))),
        concatAll(),
      )
      .subscribe(
        (form) => {
          this.form = form;
          if (Boolean(form.schema?.conceptReferences)) {
            this.labelMap = Object.entries(
              form.schema?.conceptReferences as {
                [reference: string]: { uuid?: string | null; display?: string | null };
              },
            ).reduce((acc: { [reference: string]: string }, current) => {
              if (current && current[0] && current[1]?.display) {
                acc[current[0]] = current[1].display;
              }
              return acc;
            }, {});
          }
          this.changeState('ready');
        },
        (err) => {
          // TODO: Improve error handling.
          this.loadingError = this.translateService.instant('errorLoadingForm');
          console.error('Error rendering form', err);
          this.changeState('loadingError');
        },
      );
  }

  private loadAllFormDependencies(): Observable<CreateFormParams> {
    this.formUuid = this.singleSpaPropsService.getPropOrThrow('formUuid');
    const encounterOrSyncItemId = this.singleSpaPropsService.getPropOrThrow('encounterUuid');

    const patient = this.singleSpaPropsService.getPropOrThrow('patient');
    const identifiers = this.formDataSourceService.getPatientObject(patient)?.identifiers ?? [];
    const locale = window.i18next?.language?.substring(0, 2) ?? '';
    this.translateService.addLangs([locale]);
    this.translateService.use(locale);

    import(
      /* webpackInclude: /\.mjs$/ */
      /* webpackChunkName: "./assets/l10n/locales/[request]"*/
      /* webpackMode: "lazy" */
      `@/../../../node_modules/@angular/common/locales/${locale}.mjs`
    ).then((module) => registerLocaleData(module.default));

    return forkJoin({
      formSchema: this.fetchCompiledFormSchema(this.formUuid, locale).pipe(take(1)),
      session: this.openmrsApi.getCurrentSession().pipe(take(1)),
      encounter: encounterOrSyncItemId
        ? this.getEncounterToEdit(encounterOrSyncItemId).pipe(take(1))
        : of<Encounter>(null),
      patientIdentifiers: of<Array<Identifier>>(identifiers),
    }).pipe(
      mergeMap((result) =>
        this.loadPatientPreviousEncounters(result.formSchema).pipe(
          map((previousEncounter) => ({ ...result, previousEncounter })),
        ),
      ),
      catchError((err) =>
        throwError(
          new Error(this.translateService.instant('errorFetchingFormData').replace('{detail}', JSON.stringify(err))),
        ),
      ),
    );
  }

  private fetchCompiledFormSchema(uuid: string, language: string): Observable<FormSchema> {
    return this.formSchemaService.getFormSchemaByUuid(uuid, language).pipe(take(1));
  }

  private getEncounterToEdit(encounterOrSyncItemId: string): Observable<Encounter | undefined> {
    const isOffline = this.singleSpaPropsService.getProp('isOffline', false);

    // Special handling here. We generally allow the following depending on the app mode:
    // While online:
    //   - Edit remote encounters.
    //   - Edit queued offline encounters.
    // While offline:
    //   - Edit queued offline encounters.
    //
    // Editing (cached) remote encounters while offline is explicitly excluded at this point in time
    // due to the easy potential of later conflicts when syncing.
    return isOffline
      ? from(this.getOfflineEncounterToEdit(encounterOrSyncItemId))
      : this.encounterResourceService
          .getEncounterByUuid(encounterOrSyncItemId)
          .pipe(catchError(() => from(this.getOfflineEncounterToEdit(encounterOrSyncItemId))));
  }

  private async getOfflineEncounterToEdit(syncItemId: string) {
    const syncItems = await getSynchronizationItems<PatientFormSyncItemContent>(patientFormSyncItem);
    const item = syncItems.find((item) => item._id === syncItemId);
    return item.encounter as Encounter;
  }

  private loadPatientPreviousEncounters(formSchema: FormSchema): Observable<Encounter | undefined> {
    const patientUuid = this.singleSpaPropsService.getProp('patientUuid');
    const isOffline = this.singleSpaPropsService.getProp('isOffline', false);

    if (isOffline) {
      return of(undefined);
    }

    return from(this.patientPreviousEncounter.getPreviousEncounter(formSchema.encounterType?.uuid, patientUuid));
  }

  private handleFormSubmission() {
    this.changeState('submitting');
    this.patientResourceService.validateIdentifiers(this.form).subscribe((resp) => {
      if (resp.length > 0) {
        this.changeState('readyWithValidationErrors');
        showSnackbar({
          title: this.translateService.instant('patientIdentifierDuplication'),
          subtitle: this.translateService.instant('patientIdentifierDuplicationDescription'),
          kind: 'error',
          isLowContrast: false,
        });
      } else {
        this.formSubmissionService.submitPayload(this.form).subscribe(
          ({ encounter }) => {
            this.onPostResponse(encounter);
            const isOffline = this.singleSpaPropsService.getProp('isOffline', false);
            this.changeState('submitted');

            if (!isOffline && encounter?.uuid) {
              this.encounterResourceService
                .getEncounterByUuid(encounter.uuid)
                .pipe(take(1))
                .subscribe((encounter) => {
                  if (Array.isArray(encounter?.orders)) {
                    const submittedOrders = encounter.orders.filter(({ auditInfo }) => !auditInfo.dateVoided);
                    this.showLabOrdersNotification(submittedOrders);
                  }
                });
            }

            this.programService.handlePatientCareProgram(this.form, encounter.uuid);
            showSnackbar({
              isLowContrast: true,
              kind: 'success',
              subtitle: this.translateService.instant('formSubmittedSuccessfully'),
              title: this.form.schema.display ?? this.form.schema.name,
              timeoutInMs: 5000,
            });

            this.closeForm();
          },
          (error: Error) => {
            this.changeState('submissionError');
            showSnackbar({
              isLowContrast: false,
              kind: 'error',
              subtitle: this.translateService
                .instant('formSubmissionFailed')
                .replace('{error}', this.extractErrorMessagesFromResponse(error)),

              title: this.form.schema.display ?? this.form.schema.name,
              timeoutInMs: 5000,
            });
          },
        );
      }
    });
  }

  private modifyVisitDate(visitUuid: string, visitStartDatetime: string, visitStopDatetime: string) {
    const dispose = showModal('modify-visit-date-dialog', {
      onDiscard: () => {
        dispose();
      },
      onConfirmation: () => {
        this.visitResourceService
          .updateVisitDates(visitUuid, visitStartDatetime, visitStopDatetime)
          .subscribe(() => this.handleFormSubmission());
        dispose();
      },
    });
  }

  private validateEncounterDatetimeWithVisit(encounterCreate: EncounterCreate) {
    const visitUuid = this.singleSpaPropsService.getPropOrThrow('visitUuid');
    const visitStartDatetime = this.singleSpaPropsService.getProp('visitStartDatetime');
    const visitStopDatetime = this.singleSpaPropsService.getProp('visitStopDatetime');

    if (encounterCreate.uuid) {
      if (visitStartDatetime && new Date(encounterCreate.encounterDatetime) < new Date(visitStartDatetime)) {
        this.modifyVisitDate(visitUuid, encounterCreate.encounterDatetime, visitStopDatetime);
        return false;
      } else if (visitStopDatetime && new Date(encounterCreate.encounterDatetime) > new Date(visitStopDatetime)) {
        this.modifyVisitDate(visitUuid, visitStartDatetime, encounterCreate.encounterDatetime);
        return false;
      }
    }
    return true;
  }

  public onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    const encounterToSubmit = this.formSubmissionService.buildEncounterPayload(this.form);

    const isEncounterDatetimeValid = this.validateEncounterDatetimeWithVisit(encounterToSubmit);

    if (isEncounterDatetimeValid) {
      this.handleFormSubmission();
    }
  }

  /**
   * Validates that the form is valid (and shows error messages if that is not the case).
   * Returns the validation result.
   * @returns `true` if the form is valid; `false` if not.
   */
  private validateForm(): boolean {
    if (!this.form.valid) {
      this.form.markInvalidControls(this.form.rootNode);
      this.form.showErrors = true;
      this.changeState('readyWithValidationErrors');
    }

    this.onValidate(this.form.valid);

    return this.form.valid;
  }

  public showLabOrdersNotification(submittedOrders: Array<Order> = []) {
    const orders =
      submittedOrders.map((order, index) => ` ${index + 1} : ${order.display} : ${order.orderNumber}`).join() ?? '';

    if (orders.length) {
      showSnackbar({
        title: 'Lab order(s) generated',
        kind: 'success',
        isLowContrast: true,
        subtitle: orders,
      });
    }
  }

  public closeForm() {
    const closeWorkspace = this.singleSpaPropsService.getPropOrThrow('closeWorkspace');
    closeWorkspace();
  }

  public onPostResponse(encounter: Encounter | undefined) {
    const handlePostResponse = this.singleSpaPropsService.getProp('handlePostResponse');
    if (handlePostResponse && typeof handlePostResponse === 'function') handlePostResponse(encounter);
  }

  public onValidate(valid: boolean): void {
    const handleOnValidate = this.singleSpaPropsService.getProp('handleOnValidate');
    if (handleOnValidate && typeof handleOnValidate === 'function') handleOnValidate(valid);
  }

  @HostListener('window:ampath-form-action', ['$event'])
  onFormAction(event) {
    this.ngZone.run(() => {
      const formUuid = this.singleSpaPropsService.getPropOrThrow('formUuid');
      const patientUuid = this.singleSpaPropsService.getPropOrThrow('patientUuid');
      if (event.detail?.formUuid === formUuid && event.detail?.patientUuid === patientUuid) {
        switch (event.detail?.action) {
          case 'onSubmit':
            this.onSubmit();
            break;
          case 'validateForm':
            this.validateForm();
            break;
          default:
            break;
        }
      }
    });
  }

  private changeState(state) {
    if (state != this.formState) {
      const obj = {};
      obj[this.formUuid] = state;
      store.setState(obj);
    }
  }

  /**
   * Extracts error messages from a given error response object.
   * If fieldErrors are present, it extracts the error messages from each field.
   * Otherwise, it returns the top-level error message.
   *
   * @param {object} errorObject - The error response object.
   * @returns {string[]} An array of error messages.
   */
  private extractErrorMessagesFromResponse(errorObject) {
    const error = errorObject?.error?.error;
    const fieldErrors = errorObject?.responseBody?.error?.fieldErrors;

    if (error) {
      return error?.message;
    }

    if (!fieldErrors) {
      return [errorObject?.responseBody?.error?.message ?? errorObject?.message];
    }

    return Object.values(fieldErrors).flatMap((errors: Array<Error>) => errors.map((error) => error.message));
  }
}
