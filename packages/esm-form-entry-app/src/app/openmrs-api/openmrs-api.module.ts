import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { FormResourceService } from './form-resource.service';
import { OpenmrsEsmApiService } from './openmrs-esm-api.service';
import { PersonResourceService } from './person-resource.service';
import { ProviderResourceService } from './provider-resource.service';
import { LocationResourceService } from './location-resource.service';
import { ConceptResourceService } from './concept-resource.service';
import { EncounterResourceService } from './encounter-resource.service';
import { VisitResourceService } from './visit-resource.service';
import { PatientService } from './patient-service';
import { PatientResourceService } from './patient-resource.service';
import { PatientPreviousEncounterService } from './patient-previous-encounter.service';
import { ConceptService } from '../services/concept.service';
import { AppointmentService } from './appointment-resource.service';

@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule],
  providers: [
    FormResourceService,
    OpenmrsEsmApiService,
    PersonResourceService,
    ProviderResourceService,
    LocationResourceService,
    ConceptResourceService,
    EncounterResourceService,
    VisitResourceService,
    PatientService,
    PatientResourceService,
    PatientPreviousEncounterService,
    ConceptService,
    AppointmentService
  ],
})
export class OpenmrsApiModule {}
