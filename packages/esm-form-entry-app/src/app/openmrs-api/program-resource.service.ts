import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { WindowRef } from '../window-ref';
import { Form } from '@openmrs/ngx-formentry';
import { MetaData } from '../types';
import { parseDate, restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import { SingleSpaPropsService } from '../single-spa-props/single-spa-props.service';
import { EncounterResourceService } from './encounter-resource.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class ProgramResourceService {
  constructor(
    private httpClient: HttpClient,
    protected windowRef: WindowRef,
    private singleSpaService: SingleSpaPropsService,
    private encounterResourceService: EncounterResourceService,
  ) {}

  private programEnrollmentUrl(): string {
    return `${this.windowRef.nativeWindow.openmrsBase}${restBaseUrl}/programenrollment`;
  }

  public handlePatientCareProgram(form: Form, encounterUuid: string): void {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    dayjs.tz.setDefault(timeZone);
    const careProgramMeta: MetaData | undefined = form.schema.meta?.programs;
    if (!careProgramMeta) {
      return;
    }

    const { uuid, isEnrollment, enrollmentDateQuestionId, discontinuationDateQuestionId } = careProgramMeta;
    const enrollmentDate = this.getProgramDate(form, isEnrollment, enrollmentDateQuestionId);
    const discontinuationDate = this.getProgramDate(form, !isEnrollment, discontinuationDateQuestionId);
    const locationUuid = this.getUserLocationUuid(form);

    isEnrollment
      ? this.enrollPatientToCareProgram(enrollmentDate, uuid, locationUuid, encounterUuid)
      : this.discontinuePatientFromCareProgram(discontinuationDate, encounterUuid);
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

  public enrollPatientToCareProgram(
    enrollmentDate: string,
    programUuid: string,
    locationUuid: string,
    encounterUuid: string,
  ) {
    const patientUuid = this.singleSpaService.getPropOrThrow('patientUuid');
    const enrolledDate = enrollmentDate ? enrollmentDate : dayjs();
    const inEditModeEncounterUuid = this.singleSpaService.getProp('encounterUuid');
    // Should not enroll patient if in edit mode
    if (inEditModeEncounterUuid) {
      return;
    }
    const payload = {
      patient: patientUuid,
      program: programUuid,
      dateEnrolled: enrolledDate,
      dateCompleted: null,
      location: locationUuid,
    };

    this.httpClient.post(this.programEnrollmentUrl(), payload).subscribe(
      () => {
        showSnackbar({
          title: 'Program enrollment',
          subtitle: 'Patient has been enrolled successfully',
          kind: 'success',
          isLowContrast: true,
        });
      },
      (err) => {
        // void created encounter to prevent enrollment missing an encounter
        this.encounterResourceService.voidEncounter(encounterUuid);
        showSnackbar({
          title: 'Enrollment error',
          subtitle: 'An error occurred during care program enrollment, this encounter has been voided',
          kind: 'error',
          isLowContrast: false,
        });
      },
    );
  }

  public discontinuePatientFromCareProgram(discontinuationDate: string, encounterUuid: string) {
    const { enrollmentDetails } = this.singleSpaService.getPropOrThrow('additionalProps');

    const currentDateTime = new Date();
    const hour = currentDateTime.getHours();
    const minutes = currentDateTime.getMinutes();
    const seconds = currentDateTime.getSeconds();

    const discontinuationDateTime = dayjs(discontinuationDate ?? new Date())
      .set('hour', hour)
      .set('minute', minutes)
      .set('second', seconds);
    const payload = {
      dateEnrolled: dayjs(enrollmentDetails.dateEnrolled),
      dateCompleted: discontinuationDateTime,
    };

    this.httpClient.post(`${this.programEnrollmentUrl()}/${enrollmentDetails?.uuid}`, payload).subscribe(
      (resp) => {
        showSnackbar({
          title: 'Program discontinuation',
          subtitle: 'Patient has been discontinued from care successfully',
          kind: 'success',
          isLowContrast: true,
          timeoutInMs: 5000,
        });
      },
      (error) => {
        // void created encounter to prevent care program discontinuation missing an encounter
        this.encounterResourceService.voidEncounter(encounterUuid);
        showSnackbar({
          title: 'Discontinuation error',
          subtitle: 'An error occurred during care program discontinuation, this encounter has been voided',
          kind: 'error',
          isLowContrast: false,
          timeoutInMs: 5000,
        });
      },
    );
  }
}
