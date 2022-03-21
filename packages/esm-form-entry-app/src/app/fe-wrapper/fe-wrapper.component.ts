import { Component, OnDestroy, OnInit } from '@angular/core';
import { Form } from '@ampath-kenya/ngx-formentry';
import { Observable, forkJoin, from, throwError, of, Subscription } from 'rxjs';
import { catchError, map, mergeMap, take } from 'rxjs/operators';
import { OpenmrsEsmApiService } from '../openmrs-api/openmrs-esm-api.service';
import { FormSchemaService } from '../form-schema/form-schema.service';
import { FormSubmissionService } from '../form-submission/form-submission.service';
import { EncounterResourceService } from '../openmrs-api/encounter-resource.service';
import { Encounter, FormSchema, Order } from '../types';
// @ts-ignore
import { showToast, showNotification, getSynchronizationItems } from '@openmrs/esm-framework';
import { PatientPreviousEncounterService } from '../openmrs-api/patient-previous-encounter.service';

import { patientFormSyncItem, PatientFormSyncItemContent } from '../offline/sync';
import { SingleSpaPropsService } from '../single-spa-props/single-spa-props.service';
import { CreateFormParams, FormCreationService } from '../form-creation/form-creation.service';
import { ConceptService } from '../services/concept.service';

type FormState =
  | 'initial'
  | 'loading'
  | 'loadingError'
  | 'ready'
  | 'readyWithValidationErrors'
  | 'submitting'
  | 'submitted'
  | 'submissionError';

@Component({
  selector: 'my-app-fe-wrapper',
  templateUrl: './fe-wrapper.component.html',
  styleUrls: ['./fe-wrapper.component.css'],
})
export class FeWrapperComponent implements OnInit, OnDestroy {
  private launchFormSubscription?: Subscription;

  public form: Form;
  public loadingError?: string;
  public labelMap: {};
  public formState: FormState = 'initial';
  public language: string = (window as any).i18next.language.substring(0, 2).toLowerCase();

  public constructor(
    private readonly openmrsApi: OpenmrsEsmApiService,
    private readonly formSchemaService: FormSchemaService,
    private readonly encounterResourceService: EncounterResourceService,
    private readonly formSubmissionService: FormSubmissionService,
    private readonly patientPreviousEncounter: PatientPreviousEncounterService,
    private readonly formCreationService: FormCreationService,
    private readonly singleSpaPropsService: SingleSpaPropsService,
    private conceptService: ConceptService,
  ) {}

  public ngOnInit() {
    this.launchForm();
  }

  public ngOnDestroy() {
    this.launchFormSubscription?.unsubscribe();
  }

  public launchForm() {
    this.formState = 'loading';
    this.launchFormSubscription?.unsubscribe();
    this.launchFormSubscription = this.loadAllFormDependencies()
      .pipe(
        take(1),
        map((createFormParams) => this.formCreationService.initAndCreateForm(createFormParams)),
      )
      .subscribe(
        (form) => {
          this.formState = 'ready';
          this.form = form;

          const unlabeledConcepts = this.formSchemaService.getUnlabeledConcepts(this.form);
          // Fetch concept labels from server
          this.conceptService.searchBulkConceptByUUID(unlabeledConcepts, this.language).subscribe((conceptData) => {
            this.labelMap = {};
            conceptData.forEach((concept: any) => {
              this.labelMap[concept.extId] = concept.display;
            });
          });
        },
        (err) => {
          // TODO: Improve error handling.
          this.loadingError = 'Error loading form';
          this.formState = 'loadingError';
          console.error('Error rendering form', err);
        },
      );
  }

  private loadAllFormDependencies(): Observable<CreateFormParams> {
    const formUuid = this.singleSpaPropsService.getPropOrThrow('formUuid');
    const encounterOrSyncItemId = this.singleSpaPropsService.getPropOrThrow('encounterUuid');

    return forkJoin({
      formSchema: this.fetchCompiledFormSchema(formUuid).pipe(take(1)),
      user: this.openmrsApi.getCurrentUserLocation().pipe(take(1)),
      encounter: encounterOrSyncItemId ? this.getEncounterToEdit(encounterOrSyncItemId).pipe(take(1)) : of(null),
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

  private fetchCompiledFormSchema(uuid: string): Observable<FormSchema> {
    const useCachedSchemas = true;
    return this.formSchemaService.getFormSchemaByUuid(uuid, useCachedSchemas).pipe(take(1));
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

    this.formState = 'submitting';
    this.formSubmissionService.submitPayload(this.form).subscribe(
      ({ encounter }) => {
        const isOffline = this.singleSpaPropsService.getProp('isOffline', false);
        this.formState = 'submitted';

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
        this.formState = 'submissionError';
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
      this.formState = 'readyWithValidationErrors';
    }

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
}
