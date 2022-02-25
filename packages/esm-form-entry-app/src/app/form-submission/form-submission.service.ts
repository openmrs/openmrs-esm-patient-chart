import { Injectable } from '@angular/core';

import { throwError as observableThrowError, forkJoin, Observable, Subject, of } from 'rxjs';
import { catchError, first } from 'rxjs/operators';
import { EncounterAdapter, PersonAttribuAdapter, Form } from '@ampath-kenya/ngx-formentry';
import { EncounterResourceService } from '../openmrs-api/encounter-resource.service';
import { PersonResourceService } from '../openmrs-api/person-resource.service';
import { FormDataSourceService } from '../form-data-source/form-data-source.service';

@Injectable()
export class FormSubmissionService {
  private payloadTypes: Array<string> = ['encounter', 'personAttribute'];

  constructor(
    private encounterAdapter: EncounterAdapter,
    private personAttributeAdapter: PersonAttribuAdapter,
    private encounterResourceService: EncounterResourceService,
    private personResourceService: PersonResourceService,
    private formDataSourceService: FormDataSourceService,
  ) {}

  public submitPayload(form: Form, payloadTypes: Array<string> = this.payloadTypes): Observable<any> {
    // create payload batch to be submitted on concurrently
    const payloadBatch: Array<Observable<any>> = this.createPayloadBatch(form, payloadTypes);
    return Observable.create((observer: Subject<any>) => {
      return forkJoin(payloadBatch).subscribe(
        (responses: Array<any>) => {
          if (responses) {
            const response: any = this.processFormSubmissionResponse(responses);
            response.hasError ? observer.error(response) : observer.next(response);
          }
        },
        (err) => {
          // all error at this point have been catched, unless it's a typo
          console.error('An unknown error occurred, please try again---->', err);
        },
      );
    }).pipe(first());
  }

  private createPayloadBatch(form: Form, payloadTypes: Array<string>): Array<Observable<any>> {
    const payloadBatch: Array<Observable<any>> = [];
    if (Array.isArray(payloadTypes) && payloadTypes.length > 0) {
      payloadTypes.forEach((payloadType: any, key) => {
        switch (payloadType) {
          case 'encounter':
            const providers = this.formDataSourceService.getCachedProviderSearchResults();

            if (providers && providers.length > 0 && !form.valueProcessingInfo.providerUuid) {
              const providerUuid = this.getProviderUuid(providers, form);
              form = this.setProviderUuid(form, providerUuid);
            }

            const encounterPayload: any = this.encounterAdapter.generateFormPayload(form);
            if (!this.isEmpty(encounterPayload)) {
              payloadBatch.push(
                this.submitEncounterPayload(form, encounterPayload).pipe(
                  catchError((res: any) =>
                    of({
                      hasError: true,
                      payloadType: [payloadType],
                      response: res,
                      errorMessages: this.processFormSubmissionErrors(res, payloadType, encounterPayload),
                    }),
                  ),
                ),
              );
            }
            break;
          case 'personAttribute':
            const personAttrPayload: Array<any> = this.personAttributeAdapter.generateFormPayload(form);
            if (!this.isEmpty(personAttrPayload)) {
              // this should be > 0
              payloadBatch.push(
                this.submitPersonAttributePayload(form, personAttrPayload).pipe(
                  catchError((res: any) =>
                    of({
                      hasError: true,
                      payloadType: [payloadType],
                      response: res,
                      errorMessages: this.processFormSubmissionErrors(res, payloadType, personAttrPayload),
                    }),
                  ),
                ),
              );
            }
            break;
          default:
            console.error('Invalid Payload Type, Please register');
        }
      });
    }
    return payloadBatch;
  }

  private submitEncounterPayload(form: Form, encounterPayload: any): Observable<any> {
    if (encounterPayload.uuid) {
      // editting existing form
      return this.encounterResourceService.updateEncounter(encounterPayload.uuid, encounterPayload);
    } else {
      // creating new form
      return this.encounterResourceService.saveEncounter(encounterPayload);
    }
  }

  private submitPersonAttributePayload(form: Form, payload: any): Observable<any> {
    const personAttributePayload: any = {
      attributes: payload,
    };
    if (form.valueProcessingInfo.personUuid) {
      return this.personResourceService.saveUpdatePerson(form.valueProcessingInfo.personUuid, personAttributePayload);
    } else {
      return observableThrowError('Form does not have: form.valueProcessingInfo.personUuid');
    }
  }

  private processFormSubmissionResponse(responses: Array<any>): any {
    const arrayOfErrors: Array<any> = [];
    responses.forEach((response: any, key) => {
      if (response && response.hasError) {
        arrayOfErrors.push(response);
      }
    });
    if (arrayOfErrors.length > 1) {
      // all payloads failed
      const responseObject: any = {
        hasError: true,
        payloadType: this.payloadTypes,
        response: responses,
        errorMessages: [],
      };
      arrayOfErrors.forEach((response: any, key) => {
        if (response !== undefined) {
          if (response.hasError) {
            responseObject.errorMessages.push.apply(responseObject.errorMessages, response.errorMessages);
          }
        }
      });
      return responseObject;
    } else if (arrayOfErrors.length === 1) {
      // only one payload failed
      const response: any = arrayOfErrors[0];
      return response;
    } else {
      // none of the payloads failed to save : success
      return responses;
    }
  }

  private processFormSubmissionErrors(response: any, payloadType: string, payload: any): Array<any> {
    const errors: Array<any> = [];
    switch (payloadType) {
      case 'encounter':
        errors.push('Encounter Error: ' + this.generateUserFriendlyErrorMessage(response));
        break;
      case 'personAttribute':
        errors.push('Person Attribute Error: ' + this.generateUserFriendlyErrorMessage(response));
        break;
      default:
        errors.push('Unknown Payload: ' + this.generateUserFriendlyErrorMessage(response));
    }
    return errors;
  }
  private logFormError(errorObj: object): void {
    // this.errorLogResourceService.postFormError(errorObj).subscribe(
    //   (responses: Array<any>) => {
    //     if (responses) {
    //       console.log('Form submission error logged to server successfully', responses);
    //     }
    //   },
    //   (err) => {
    //     console.error('An error occurred, while logging error to etl server', err);
    //   }
    // );
  }

  private generateUserFriendlyErrorMessage(response: any): string {
    let message = 'An error occurred, please try again';
    if (this.isEmpty(response.error)) {
      message = 'Please check your internet connection, you seem to be offline.';
    } else {
      if (!this.isEmpty(response.error?.error?.fieldErrors)) {
        // handle field errors
        const arrayErrors: Array<any> = [];
        for (const o in response.error.error.fieldErrors) {
          if (response.error.error.fieldErrors.hasOwnProperty(o)) {
            const fieldErrors = response.error.error.fieldErrors[o];
            fieldErrors.forEach((error: any) => {
              arrayErrors.push(error.message);
            });
          }
        }
        message = JSON.stringify(arrayErrors);
      } else if (!this.isEmpty(response.error?.message)) {
        message = response.error.message;
      }
    }

    return message;
  }

  private getProviderUuid(providers, form: Form): string {
    const encounterProvider = form.searchNodeByQuestionId('provider');
    let personUuid: string = null;
    if (encounterProvider.length > 0) {
      personUuid = encounterProvider[0].control.value;
    }

    const filtered = providers.filter((p: any) => {
      if (p.id === personUuid) {
        return true;
      } else {
        return false;
      }
    });
    if (filtered.length > 0) {
      return filtered[0].providerUuid;
    }
    return personUuid;
  }

  private setProviderUuid(form: Form, providerUuid: string): Form {
    form.valueProcessingInfo.providerUuid = providerUuid;
    return form;
  }

  private isEmpty(obj): boolean {
    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return true;
      }
    } else {
      if (obj === null || obj === undefined) {
        return true;
      }
      if (typeof obj === 'string' && obj.trim().length === 0) {
        return true;
      }
      return this.isObjectEmpty(obj);
    }
    return false;
  }

  private isObjectEmpty(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }
}
