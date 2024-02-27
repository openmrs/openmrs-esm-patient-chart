import { Injectable } from '@angular/core';

import { forkJoin, Observable, of, from } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { EncounterAdapter, PersonAttribuAdapter, Form } from '@openmrs/ngx-formentry';
import { NodeBase } from '@openmrs/ngx-formentry/form-entry/form-factory/form-node';
import { EncounterResourceService } from '../openmrs-api/encounter-resource.service';
import { PersonResourceService } from '../openmrs-api/person-resource.service';
import { FormDataSourceService } from '../form-data-source/form-data-source.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Person, PersonUpdate, EncounterCreate, Encounter, IdentifierPayload, Identifier, ErrorObject } from '../types';
import {
  findQueuedPatientFormSyncItemByContentId,
  PatientFormSyncItemContent,
  queuePatientFormSyncItem,
} from '../offline/sync';
import isEmpty from 'lodash-es/isEmpty';
import cloneDeep from 'lodash-es/cloneDeep';
import { mutateEncounterCreateToPartialEncounter } from '../offline/syncItemMutation';
import { SingleSpaPropsService } from '../single-spa-props/single-spa-props.service';
import { v4 } from 'uuid';
import { VisitResourceService } from '../openmrs-api/visit-resource.service';
import { PatientResourceService } from '../openmrs-api/patient-resource.service';
import { ConfigResourceService } from '../services/config-resource.service';
import { TranslateService } from '@ngx-translate/core';
/**
 * The result of submitting a form via the {@link FormSubmissionService.submitPayload} function.
 */
interface FormSubmissionResult {
  encounter: Encounter;
  identifiers?: Array<Identifier>;
  person?: Person;
}

@Injectable()
export class FormSubmissionService {
  constructor(
    private readonly encounterAdapter: EncounterAdapter,
    private readonly personAttributeAdapter: PersonAttribuAdapter,
    private readonly encounterResourceService: EncounterResourceService,
    private readonly personResourceService: PersonResourceService,
    private readonly formDataSourceService: FormDataSourceService,
    private readonly singleSpaPropsService: SingleSpaPropsService,
    private readonly visitResourceService: VisitResourceService,
    private readonly patientResourceService: PatientResourceService,
    private readonly configResourceService: ConfigResourceService,
    private readonly translateService: TranslateService,
  ) {}

  public submitPayload(form: Form): Observable<FormSubmissionResult> {
    const isOffline = this.singleSpaPropsService.getProp('isOffline', false);
    const encounterOrSyncItemIdToEdit = this.singleSpaPropsService.getProp('encounterUuid');
    const existingSyncItem = from(findQueuedPatientFormSyncItemByContentId(encounterOrSyncItemIdToEdit));

    return existingSyncItem.pipe(
      mergeMap((syncItem) => {
        const isOfflineSubmission = isOffline || !!syncItem;

        if (isOfflineSubmission) {
          this.deepClearInitialNodeValues(form.rootNode);
        }

        const encounterCreate = this.onEncounterCreate(this.buildEncounterPayload(form));
        const personUpdate = this.buildPersonUpdatePayload(form);
        const identifierPayload = this.patientResourceService.buildIdentifierPayload(form);

        return isOfflineSubmission
          ? this.submitPayloadOffline(form, encounterCreate, personUpdate, syncItem?.content._id)
          : this.submitPayloadOnline(encounterCreate, personUpdate, identifierPayload);
      }),
    );
  }

  /**
   * Recursively clears all `initialValue` attributes of the given form node and of all its children.
   * This ensures that the form node returns the final entities (e.g. encounters) in the "Create" format
   * (and not the diffed "Update" format).
   * @param node The form node whose `initialValue` attributes should be cleared (recursively, i.e. including
   * all of the nodes children).
   */
  private deepClearInitialNodeValues(node: NodeBase) {
    node.initialValue = undefined;

    if (node.children && typeof node.children === 'object') {
      for (const child of Object.values(node.children)) {
        this.deepClearInitialNodeValues(child as NodeBase);
      }
    }
  }

  private onEncounterCreate(encounterCreate: EncounterCreate): EncounterCreate {
    const handleEncounterCreate = this.singleSpaPropsService.getProp('handleEncounterCreate');
    if (handleEncounterCreate && typeof handleEncounterCreate === 'function') handleEncounterCreate(encounterCreate);
    return encounterCreate;
  }

  private submitPayloadOffline(
    form: Form,
    encounterCreate: EncounterCreate,
    personUpdate: PersonUpdate,
    syncItemIdToEdit: string | undefined,
  ): Observable<FormSubmissionResult> {
    const encounter = mutateEncounterCreateToPartialEncounter(cloneDeep(encounterCreate));
    const result: FormSubmissionResult = { encounter: encounter as any };
    const syncItem: PatientFormSyncItemContent = {
      _id: syncItemIdToEdit ?? v4(),
      formSchemaUuid: form.schema.uuid,
      encounter,
      _payloads: {
        encounterCreate,
        personUpdate,
      },
    };

    return from(queuePatientFormSyncItem(syncItem).then(() => result));
  }

  private submitPayloadOnline(
    encounterCreate: EncounterCreate,
    personUpdate: PersonUpdate,
    identifierPayload: IdentifierPayload,
  ): Observable<FormSubmissionResult> {
    return forkJoin({
      encounter: this.submitEncounter(encounterCreate),
      person: this.submitPersonUpdate(personUpdate),
      identifiers: this.submitPatientIdentifier(identifierPayload),
    });
  }

  private updateOrSaveEncounter(encounterCreate: EncounterCreate): Observable<Encounter | undefined> {
    if (encounterCreate.uuid) {
      return this.encounterResourceService
        .updateEncounter(encounterCreate.uuid, encounterCreate)
        .pipe(catchError((res) => this.throwUserFriendlyError(res)));
    } else {
      return this.encounterResourceService
        .saveEncounter(encounterCreate)
        .pipe(catchError((res) => this.throwUserFriendlyError(res)));
    }
  }

  private confirmVisitDateAdjustment() {
    // TODO: Add translations once ngx-translate is in place
    return confirm(
      'The encounter date falls outside the designated visit date range. Would you like to modify the visit date to accommodate the new encounter date?',
    );
  }

  private submitEncounter(encounterCreate: EncounterCreate): Observable<Encounter | undefined> {
    if (!encounterCreate) {
      return of(undefined);
    }
    const config = this.configResourceService.getConfig();

    const visitUuid = this.singleSpaPropsService.getPropOrThrow('visitUuid');
    const visitStartDatetime = this.singleSpaPropsService.getProp('visitStartDatetime');
    const visitStopDatetime = this.singleSpaPropsService.getProp('visitStopDatetime');

    if (config.customEncounterDatetime === false) {
      if (encounterCreate.uuid) {
        if (
          visitStartDatetime &&
          new Date(encounterCreate.encounterDatetime) < new Date(visitStartDatetime) &&
          this.confirmVisitDateAdjustment()
        ) {
          return this.visitResourceService
            .updateVisitDates(visitUuid, encounterCreate.encounterDatetime, visitStopDatetime)
            .pipe(switchMap(() => this.updateOrSaveEncounter(encounterCreate)));
        } else if (
          visitStopDatetime &&
          new Date(encounterCreate.encounterDatetime) > new Date(visitStopDatetime) &&
          this.confirmVisitDateAdjustment()
        ) {
          return this.visitResourceService
            .updateVisitDates(visitUuid, visitStartDatetime, encounterCreate.encounterDatetime)
            .pipe(switchMap(() => this.updateOrSaveEncounter(encounterCreate)));
        }
      }
    }

    return this.updateOrSaveEncounter(encounterCreate);
  }

  private submitPersonUpdate(personUpdate: PersonUpdate): Observable<Person | undefined> {
    if (!personUpdate) {
      return of(undefined);
    }

    return this.personResourceService
      .saveUpdatePerson(personUpdate.uuid!, personUpdate)
      .pipe(catchError((res) => this.throwUserFriendlyError(res)));
  }

  public buildEncounterPayload(form: Form): EncounterCreate | undefined {
    const providers = this.formDataSourceService.getCachedProviderSearchResults();

    if (providers?.length && !form.valueProcessingInfo.providerUuid) {
      const providerUuid = this.findProviderUuidFormForm(providers, form);
      form.valueProcessingInfo.providerUuid = providerUuid;
    }

    const encounterPayload = this.encounterAdapter.generateFormPayload(form) as unknown as EncounterCreate;

    //Assign location to encounter payload if no location field is present on the form
    if (!encounterPayload.hasOwnProperty('location') && form.dataSourcesContainer.dataSources?.userLocation?.uuid)
      encounterPayload.location = form.dataSourcesContainer.dataSources.userLocation.uuid;

    return isEmpty(encounterPayload) ? undefined : encounterPayload;
  }

  private findProviderUuidFormForm(providers: Array<any>, form: Form): string | undefined {
    const encounterProvider = form.searchNodeByQuestionId('provider');
    const personUuid = encounterProvider[0]?.control.value;
    const providerUuid = providers.find((provider) => provider.id === personUuid)?.providerUuid;
    return providerUuid ?? personUuid;
  }

  private buildPersonUpdatePayload(form: Form): PersonUpdate | undefined {
    if (!form.valueProcessingInfo.personUuid) {
      throw new Error(
        'The form is missing a required value for submitting person updates: form.valueProcessingInfo.personUuid',
      );
    }

    const attributes = this.personAttributeAdapter.generateFormPayload(form);
    if (isEmpty(attributes)) {
      return undefined;
    }

    return { uuid: form.valueProcessingInfo.personUuid, attributes: attributes };
  }

  private submitPatientIdentifier(identifierPayload): Observable<any> {
    const patientUuid = this.singleSpaPropsService.getPropOrThrow('patientUuid');

    const { newIdentifiers, currentIdentifiers } = identifierPayload;
    if (newIdentifiers?.length > 0) {
      const payload = { ...newIdentifiers.reduce((acc, cur) => Object.assign(cur, acc), {}) };
      return this.patientResourceService.createPatientIdentifier(patientUuid, payload);
    }
    if (currentIdentifiers?.length > 0) {
      const { uuid, identifier, location } = currentIdentifiers[0] ?? {};
      return this.patientResourceService.saveUpdatePatientIdentifier(patientUuid, uuid, {
        identifier: identifier,
        location: location,
      });
    }
    return of(undefined);
  }

  // TODO: Should this function be extracted?
  // This type of general HTTP/REST API error handling is most likely also useful elsewhere.
  private throwUserFriendlyError(error: HttpErrorResponse): never {
    const errorMessage = this.extractErrorMessagesFromResponse(error?.error ?? error);
    throw new Error(errorMessage);
  }

  /**
   * Extracts error messages from a given error response object.
   * If fieldErrors are present, it extracts the error messages from each field.
   * If globalErrors are present, it extracts the error messages from each global error.
   * Otherwise, it returns the top-level error message.
   *
   * @param {ErrorObject} errorObject - The error response object.
   * @returns {string[]} An array of error messages.
   */
  private extractErrorMessagesFromResponse(errorObject: ErrorObject) {
    const {
      error: { fieldErrors, globalErrors, message, code },
    } = errorObject ?? {};

    if (fieldErrors) {
      return Object.values(fieldErrors)
        .flatMap((errors) => errors.map((error) => error.message))
        .join('\n');
    }

    if (globalErrors) {
      return Object.values(globalErrors)
        .flatMap((errors) => errors.map((error) => error.message))
        .join('\n');
    }

    return message ?? code ?? this.translateService.instant('unknownError');
  }
}
