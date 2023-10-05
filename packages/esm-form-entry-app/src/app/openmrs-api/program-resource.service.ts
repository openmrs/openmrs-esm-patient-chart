import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { WindowRef } from '../window-ref';
import { Form } from '@openmrs/ngx-formentry';
import { EncounterCreate, MetaData, PatientProgram } from '../types';
import { showNotification, showToast } from '@openmrs/esm-framework';
import first from 'lodash-es/first';

interface ProgramEnrollmentPayload {
  patient: string;
  program: string;
  dateEnrolled: string | Date;
  dateCompleted: string | Date | null;
  location: string;
}

@Injectable()
export class ProgramResourceService {
  constructor(
    private httpClient: HttpClient,
    protected windowRef: WindowRef,
  ) {}

  private getBaseProgramsUrl(): string {
    return `${this.windowRef.nativeWindow.openmrsBase}/ws/rest/v1/programenrollment`;
  }

  public fetchPatientPrograms(patientUuid: string): Observable<any> {
    const params = new HttpParams()
      .set('patient', patientUuid)
      .set('v', 'custom:(uuid,program:(uuid,name),dateEnrolled,dateCompleted,location:(uuid,name))');
    return this.httpClient.get(this.getBaseProgramsUrl(), { params });
  }

  public createProgramEnrollment(payload: ProgramEnrollmentPayload): Observable<any> {
    return this.httpClient
      .post(this.getBaseProgramsUrl(), payload)
      .pipe(catchError((error) => this.handleError(error, 'Program Enrollment')));
  }

  public updateProgramEnrollment(payload: ProgramEnrollmentPayload, enrollmentUuid: string): Observable<any> {
    return this.httpClient
      .post(`${this.getBaseProgramsUrl()}/${enrollmentUuid}`, payload)
      .pipe(catchError((error) => this.handleError(error, 'Program Update')));
  }

  public deleteProgramEnrollment(enrollmentUuid: string): Observable<any> {
    return this.httpClient
      .delete(`${this.getBaseProgramsUrl()}/${enrollmentUuid}?purge=true`)
      .pipe(catchError((error) => this.handleError(error, 'Program Deletion')));
  }

  private createProgramEnrollmentPayload(
    programUuid: string,
    locationUuid: string,
    patientUuid: string,
    dateEnrolled: Date | string,
    dateCompleted: Date | null,
  ): ProgramEnrollmentPayload {
    return {
      patient: patientUuid,
      program: programUuid,
      dateEnrolled: dateEnrolled,
      dateCompleted: dateCompleted ?? null,
      location: locationUuid,
    };
  }

  private showToastMessage(title: string, description: string, kind: 'success' | 'error'): void {
    showToast({ title, description, kind });
  }

  private handleError(error: any, operation: string): Observable<any> {
    this.showToastMessage(`${operation} has failed`, 'An error occurred', 'error');
    console.error(error); // Log to console for debugging
    throw error;
  }

  public handleProgramEnrollmentAndDiscontinuation(
    form: Form,
    patientUuid: string,
    encounterToCreate: EncounterCreate,
  ): void {
    const meta = form.schema?.meta;
    if (!meta) {
      return;
    }

    const programInfo: MetaData = meta.programs;
    const date = programInfo.enrollmentDateQuestionId
      ? first(form.searchNodeByQuestionId(programInfo.enrollmentDateQuestionId)).control.value
      : new Date();

    const payload = this.createProgramEnrollmentPayload(
      programInfo.uuid,
      encounterToCreate.location,
      patientUuid,
      date,
      null,
    );

    if (programInfo.isEnrollment) {
      this.createProgramEnrollment(payload).subscribe(() => {
        this.showToastMessage('Enrollment saved successfully', 'Patient has been enrolled in the program', 'success');
      });
      return;
    }

    this.fetchPatientPrograms(patientUuid).subscribe((patientPrograms) => {
      this.handleProgramDiscontinuation(form, patientPrograms, programInfo, payload);
    });
  }

  private handleProgramDiscontinuation(
    form: Form,
    patientPrograms: { results: Array<PatientProgram> },
    programInfo: MetaData,
    payload,
  ): void {
    const activePrograms = patientPrograms.results.filter(({ dateCompleted }) => dateCompleted === null);
    if (activePrograms.length === 0) {
      return;
    }

    activePrograms.sort(
      (programA, programB) => new Date(programB.dateEnrolled).getTime() - new Date(programA.dateEnrolled).getTime(),
    );

    const patientProgramInfo = activePrograms[0];
    const discontinuationDate = first(form.searchNodeByQuestionId(programInfo.discontinuationDateQuestionId)).control
      .value;
    payload.dateCompleted = new Date(discontinuationDate);
    delete payload.program;
    delete payload.patient;
    payload.dateEnrolled = new Date(patientProgramInfo.dateEnrolled);

    this.updateProgramEnrollment(payload, patientProgramInfo.uuid).subscribe(() => {
      this.showToastMessage(
        'Discontinuation saved successfully',
        'Patient has been discontinued from the program',
        'success',
      );
    });
  }
}
