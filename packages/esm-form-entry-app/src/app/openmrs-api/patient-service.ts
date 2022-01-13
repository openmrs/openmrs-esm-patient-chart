import { Injectable } from '@angular/core';
import { ReplaySubject, BehaviorSubject, Observable, forkJoin, combineLatest } from 'rxjs';
import { EncounterResourceService } from '../openmrs-api/encounter-resource.service';
import { PatientResourceService } from './patient-resource.service';

@Injectable()
export class PatientService {
  public currentlyLoadedPatient: BehaviorSubject<any> = new BehaviorSubject(null);
  public currentlyLoadedPatientUuid = new BehaviorSubject<string>(null);
  public isBusy: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private patientResourceService: PatientResourceService,
    private encounterResource: EncounterResourceService,
  ) {}

  public setCurrentlyLoadedPatientByUuid(patientUuid: string): BehaviorSubject<any> {
    if (this.currentlyLoadedPatient.value !== null) {
      // this means there is already a currently loaded patient
      const previousPatient = this.currentlyLoadedPatient.value;
      // fetch from server if patient is NOT the same
      if (previousPatient.uuid !== patientUuid) {
        this.fetchPatientByUuid(patientUuid);
      }
    } else {
      // At this point we have not set patient object so let's hit the server
      this.fetchPatientByUuid(patientUuid);
    }
    return this.currentlyLoadedPatient;
  }

  public fetchPatientByUuid(patientUuid: string) {
    // reset patient
    this.currentlyLoadedPatient.next(null);
    this.currentlyLoadedPatientUuid.next(null);
    // busy
    this.isBusy.next(true);
    // hit server
    return forkJoin(
      this.patientResourceService.getPatientByUuid(patientUuid, false),
      this.encounterResource.getEncountersByPatientUuid(patientUuid),
    ).subscribe(
      (data) => {
        const patient = data[0];
        patient.encounters = data[1];
        this.currentlyLoadedPatient.next(patient);
        this.currentlyLoadedPatientUuid.next(patientUuid);
        this.isBusy.next(false);
      },
      (err) => {
        console.error(err);
        this.isBusy.next(false);
      },
    );
  }

  public reloadCurrentPatient() {
    if (this.currentlyLoadedPatient.value !== null) {
      const previousPatient = this.currentlyLoadedPatient.value;
      this.fetchPatientByUuid(previousPatient.uuid);
    }
  }
  public resetPatientService() {
    this.currentlyLoadedPatient = new BehaviorSubject(null);
    this.currentlyLoadedPatientUuid = new BehaviorSubject<string>(null);
    this.isBusy = new BehaviorSubject(false);
  }
}
