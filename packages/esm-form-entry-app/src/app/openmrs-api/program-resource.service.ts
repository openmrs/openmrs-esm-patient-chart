// program-resource.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WindowRef } from '../window-ref';
import { Form } from '@openmrs/ngx-formentry';
import { Encounter, MetaData } from '../types';
import { restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import { SingleSpaPropsService } from '../single-spa-props/single-spa-props.service';
import { EncounterResourceService } from './encounter-resource.service';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Injectable({
  providedIn: 'root',
})
export class ProgramResourceService {
  constructor(
    private httpClient: HttpClient,
    protected windowRef: WindowRef,
    private singleSpaService: SingleSpaPropsService,
    private encounterResourceService: EncounterResourceService,
  ) {}

  private programEnrollmentUrl(): string {
    return `${this.windowRef.nativeWindow.openmrsBase}${restBaseUrl}/programenrollment--`;
  }

  public handlePatientCareProgram(form: Form, encounter: Encounter): Observable<any> {
    const careProgramMeta: MetaData | undefined = form.schema.meta?.programs;
    if (!careProgramMeta) {
      return of(null);
    }

    const { uuid, isEnrollment, enrollmentDateQuestionId, discontinuationDateQuestionId } = careProgramMeta;
    const enrollmentDate =
      this.getProgramDate(form, isEnrollment, enrollmentDateQuestionId) ?? encounter.encounterDatetime;
    const discontinuationDate = this.getProgramDate(form, !isEnrollment, discontinuationDateQuestionId);
    const locationUuid = this.getUserLocationUuid(form);
    const utcOffset = form.valueProcessingInfo.utcOffset ?? '+0300';

    return isEnrollment
      ? this.enrollPatientToCareProgram(enrollmentDate, uuid, locationUuid, encounter.uuid, utcOffset)
      : this.discontinuePatientFromCareProgram(discontinuationDate, encounter.uuid, utcOffset);
  }

  public enrollPatientToCareProgram(
    enrollmentDate: string,
    programUuid: string,
    locationUuid: string,
    encounterUuid: string,
    utcOffset: string,
  ): Observable<any> {
    const patientUuid = this.singleSpaService.getPropOrThrow('patientUuid');
    const enrolledDate = enrollmentDate ? enrollmentDate : dayjs(new Date()).utcOffset(utcOffset).format();
    const inEditModeEncounterUuid = this.singleSpaService.getProp('encounterUuid');

    if (inEditModeEncounterUuid) {
      return of(null);
    }

    const payload = {
      patient: patientUuid,
      program: programUuid,
      dateEnrolled: enrolledDate,
      dateCompleted: null,
      location: locationUuid,
    };

    return this.httpClient.post(this.programEnrollmentUrl(), payload).pipe(
      tap(() => {
        showSnackbar({
          title: 'Program enrollment',
          subtitle: 'Patient has been enrolled successfully',
          kind: 'success',
          isLowContrast: true,
        });
      }),
      catchError((error) => this.handleEnrollmentError(error, encounterUuid)),
    );
  }

  public discontinuePatientFromCareProgram(
    discontinuationDate: string,
    encounterUuid: string,
    utcOffset: string,
  ): Observable<any> {
    const { enrollmentDetails } = this.singleSpaService.getPropOrThrow('additionalProps');
    const currentDateTime = new Date();
    const discontinuationDateTime = dayjs(discontinuationDate ?? currentDateTime)
      .set('hour', currentDateTime.getHours())
      .set('minute', currentDateTime.getMinutes())
      .set('second', currentDateTime.getSeconds());

    const payload = {
      dateEnrolled: dayjs(enrollmentDetails.dateEnrolled).utcOffset(utcOffset).format(),
      dateCompleted: discontinuationDateTime.utcOffset(utcOffset).format(),
    };

    return this.httpClient.post(`${this.programEnrollmentUrl()}/${enrollmentDetails?.uuid}`, payload).pipe(
      tap(() => {
        showSnackbar({
          title: 'Program discontinuation',
          subtitle: 'Patient has been discontinued from care successfully',
          kind: 'success',
          isLowContrast: true,
          timeoutInMs: 5000,
        });
      }),
      catchError((error) => this.handleDiscontinuationError(error, encounterUuid)),
    );
  }

  private handleEnrollmentError(error: any, encounterUuid: string): Observable<never> {
    return this.voidEncounter(encounterUuid).pipe(
      tap(() => {
        showSnackbar({
          title: 'Enrollment error',
          subtitle: 'An error occurred during care program enrollment, this encounter has been voided',
          kind: 'error',
          isLowContrast: true,
        });
      }),
      switchMap(() => throwError(error)),
    );
  }

  private handleDiscontinuationError(error: any, encounterUuid: string): Observable<never> {
    return this.voidEncounter(encounterUuid).pipe(
      tap(() => {
        showSnackbar({
          title: 'Discontinuation error',
          subtitle: 'An error occurred during care program discontinuation, this encounter has been voided',
          kind: 'error',
          isLowContrast: false,
          timeoutInMs: 5000,
        });
      }),
      switchMap(() => throwError(error)),
    );
  }

  private voidEncounter(encounterUuid: string): Observable<any> {
    return this.encounterResourceService.voidEncounter(encounterUuid).pipe(
      catchError((voidError) => {
        console.error('Failed to void encounter', voidError);
        showSnackbar({
          title: 'Voiding Error',
          subtitle: 'Failed to void the encounter. Please check the logs.',
          kind: 'error',
          isLowContrast: false,
          timeoutInMs: 5000,
        });
        return throwError(voidError);
      }),
    );
  }

  private getProgramDate(form: Form, condition: boolean, questionId?: string): string | undefined {
    return condition && questionId ? this.getNodeValueById(form, questionId) : undefined;
  }

  private getNodeValueById(form: Form, questionId: string): string | undefined {
    return form.searchNodeByQuestionId(questionId)?.[0]?.control.value;
  }

  private getUserLocationUuid(form: Form): string {
    return form.dataSourcesContainer.dataSources['userLocation'].uuid;
  }
}
