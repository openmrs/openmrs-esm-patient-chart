import { NgZone, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Form } from '@openmrs/ngx-formentry';
import { Observable, forkJoin, from, throwError, of, Subscription } from 'rxjs';
import { catchError, concatAll, map, mergeMap, take } from 'rxjs/operators';
import { OpenmrsEsmApiService } from '../openmrs-api/openmrs-esm-api.service';
import { FormSchemaService } from '../form-schema/form-schema.service';
import { FormSubmissionService } from '../form-submission/form-submission.service';
import { EncounterResourceService } from '../openmrs-api/encounter-resource.service';
import { Encounter, FormSchema, Order } from '../types';
import { showToast, showNotification, getSynchronizationItems, createGlobalStore } from '@openmrs/esm-framework';
import type { Unsubscribe } from 'unistore';
import { PatientPreviousEncounterService } from '../openmrs-api/patient-previous-encounter.service';

import { patientFormSyncItem, PatientFormSyncItemContent } from '../offline/sync';
import { SingleSpaPropsService } from '../single-spa-props/single-spa-props.service';
import { CreateFormParams, FormCreationService } from '../form-creation/form-creation.service';
import { ConceptService } from '../services/concept.service';
import { TranslateService } from '@ngx-translate/core';

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
  private unsubscribeStore: Unsubscribe | undefined;

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
    private readonly conceptService: ConceptService,
    private readonly translateService: TranslateService,
    private readonly ngZone: NgZone,
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
    this.changeState('loading');
    this.showDiscardSubmitButtons = this.singleSpaPropsService.getProp('showDiscardSubmitButtons') ?? true;
    this.launchFormSubscription?.unsubscribe();
    this.launchFormSubscription = this.loadAllFormDependencies()
      .pipe(
        take(1),
        map((createFormParams) => from(this.formCreationService.initAndCreateForm(createFormParams))),
        concatAll(),
        mergeMap(async (form) => {
          const unlabeledConcepts = FormSchemaService.getUnlabeledConceptIdentifiersFromSchema(form.schema);
          return {
            form,
            concepts: await this.conceptService.searchConceptsByIdentifiers(unlabeledConcepts).toPromise(),
          };
        }),
      )
      .subscribe(
        ({ form, concepts }) => {
          this.form = form;
          if (concepts) {
            this.labelMap = concepts.reduce((acc, current) => {
              if (Boolean(current)) {
                acc[current.identifier] = current.display;
              }

              return acc;
            }, {});
          }
          this.changeState('ready');
        },
        (err) => {
          // TODO: Improve error handling.
          this.loadingError = 'Error loading form';
          console.error('Error rendering form', err);
          this.changeState('loadingError');
        },
      );
  }

  private loadAllFormDependencies(): Observable<CreateFormParams> {
    this.formUuid = this.singleSpaPropsService.getPropOrThrow('formUuid');
    const encounterOrSyncItemId = this.singleSpaPropsService.getPropOrThrow('encounterUuid');
    const language = window.i18next?.language?.substring(0, 2) ?? '';
    this.translateService.addLangs([language]);
    this.translateService.use(language);

    return forkJoin({
      formSchema: this.fetchCompiledFormSchema(this.formUuid, language).pipe(take(1)),
      session: this.openmrsApi.getCurrentSession().pipe(take(1)),
      encounter: encounterOrSyncItemId
        ? this.getEncounterToEdit(encounterOrSyncItemId).pipe(take(1))
        : of<Encounter>(null),
    }).pipe(
      mergeMap((result) =>
        this.loadPatientPreviousEncounters(result.formSchema).pipe(
          map((previousEncounter) => ({ ...result, previousEncounter })),
        ),
      ),
      catchError((err) =>
        throwError(new Error('There was an error fetching form data. Details: ' + JSON.stringify(err))),
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

  public onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.changeState('submitting');
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

        showToast({
          critical: true,
          kind: 'success',
          description: `The form has been submitted successfully.`,
          title: this.form.schema.name,
        });

        this.closeForm();
      },
      (error: Error) => {
        this.changeState('submissionError');
        showToast({
          critical: true,
          kind: 'error',
          description: `An error has occurred while submitting the form. Error: ${JSON.stringify(
            error?.message,
            null,
            2,
          )}.`,
          title: this.form.schema.name,
        });
      },
    );
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
      showNotification({
        title: 'Lab order(s) generated',
        kind: 'success',
        critical: true,
        description: orders,
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
}
