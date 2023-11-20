import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { WindowRef } from '../window-ref';
import { Form } from '@openmrs/ngx-formentry';
import { MetaData, PatientProgram } from '../types';
import { parseDate, showNotification, showToast } from '@openmrs/esm-framework';
import { SingleSpaPropsService } from '../single-spa-props/single-spa-props.service';
import { EncounterResourceService } from './encounter-resource.service';
import moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ProgramResourceService {
  constructor(
    private httpClient: HttpClient,
    protected windowRef: WindowRef,
    private singleSpaService: SingleSpaPropsService,
    private encounterResourceService: EncounterResourceService,
  ) {}

  private programEnrollmentUrl(): string {
    return `${this.windowRef.nativeWindow.openmrsBase}/ws/rest/v1/programenrollment`;
  }

  public handlePatientCareProgram(form: Form, encounterUuid: string) {
    const careProgramMeta: MetaData = form.schema.meta?.programs;
    if (!careProgramMeta) return;
    const { uuid, isEnrollment, enrollmentDateQuestionId, discontinuationDateQuestionId } = careProgramMeta;

    const getNodeValueById = (questionId) => form.searchNodeByQuestionId(questionId)?.[0]?.control.value;
    const enrollmentDate =
      isEnrollment && enrollmentDateQuestionId ? getNodeValueById(enrollmentDateQuestionId) : undefined;
    const discontinuationDate =
      isEnrollment && discontinuationDateQuestionId ? undefined : getNodeValueById(discontinuationDateQuestionId);

    const locationUuid = form.dataSourcesContainer.dataSources['userLocation'].uuid;

    isEnrollment
      ? this.enrollPatientToCareProgram(enrollmentDate, uuid, locationUuid, encounterUuid)
      : this.discontinuePatientFromCareProgram(discontinuationDate, encounterUuid);
  }

  public enrollPatientToCareProgram(
    enrollmentDate: string,
    programUuid: string,
    locationUuuid: string,
    encounterUuid: string,
  ) {
    const patientUuid = this.singleSpaService.getPropOrThrow('patientUuid');
    const enrolledDate = enrollmentDate ? enrollmentDate : new Date().toISOString();

    const payload = {
      patient: patientUuid,
      program: programUuid,
      dateEnrolled: parseDate(enrolledDate),
      dateCompleted: null,
      location: locationUuuid,
    };

    this.isPatientEnrolled(patientUuid, programUuid).subscribe((result: boolean) => {
      if (!result) {
        this.httpClient.post(this.programEnrollmentUrl(), payload).subscribe(
          (response) => {
            showToast({
              title: 'Program enrollment',
              description: 'Patient has been enrolled successfully',
              kind: 'success',
            });
          },
          (err) => {
            // void created encounter to prevent enrollment missing an encounter
            this.encounterResourceService.voidEncounter(encounterUuid);
            showNotification({
              title: 'Enrollment error',
              description: 'An error occurred during care program enrollment, this encounter has been voided',
              kind: 'error',
            });
          },
        );
      }
    });
  }

  public discontinuePatientFromCareProgram(discontinuationDate: string, encounterUuid: string) {
    const { enrollmenrDetails: enrollmentDetails } = this.singleSpaService.getPropOrThrow('additionalProps');

    const currentDateTime = new Date();
    const hour = currentDateTime.getHours();
    const minutes = currentDateTime.getMinutes();
    const seconds = currentDateTime.getSeconds();

    const discontinuationDateTime = moment(discontinuationDate ?? new Date())
      .set('hour', hour)
      .set('minute', minutes)
      .set('second', seconds)
      .toISOString();
    const payload = {
      dateEnrolled: moment(enrollmentDetails.dateEnrolled).toISOString(),
      dateCompleted: moment(discontinuationDateTime).toISOString(),
    };

    this.httpClient.post(`${this.programEnrollmentUrl()}/${enrollmentDetails?.uuid}`, payload).subscribe(
      (resp) => {
        showToast({
          title: 'Program discontinuation',
          description: 'Patient has been discontinued from care successfully',
          kind: 'success',
        });
      },
      (error) => {
        // void created encounter to prevent care program discontinuation missing an encounter
        this.encounterResourceService.voidEncounter(encounterUuid);
        showNotification({
          title: 'Discontinuation error',
          description: 'An error occurred during care program discontinuation, this encounter has been voided',
          kind: 'error',
        });
      },
    );
  }

  public isPatientEnrolled(patientUuid: string, programUuid: string): Observable<boolean> {
    const url = this.programEnrollmentUrl() + `?patient=${patientUuid}&v=full`;
    return this.httpClient.get(url).pipe(
      map((response: any) => {
        if (response && response.results) {
          return !!response.results.find((patientProgram: PatientProgram) => {
            return patientProgram.program.uuid === programUuid && patientProgram.dateCompleted === null;
          });
        }
        return false;
      }),
    );
  }
}
