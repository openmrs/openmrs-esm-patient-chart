import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import AllergyDetailedSummary from './allergies-detailed-summary.component';
import { AllergiesContext } from './allergies.context';

interface AllergiesProps {
  basePath: string;
  patient: fhir.Patient;
  patientUuid: string;
  showAddAllergyButton: boolean;
}

export default function Allergies({ basePath, patient, patientUuid, showAddAllergyButton }: AllergiesProps) {
  return (
    <AllergiesContext.Provider value={{ patientUuid, patient }}>
      <BrowserRouter basename={`${window.spaBase}${basePath}/allergies`}>
        <Switch>
          <Route
            exact
            path="/"
            render={() => <AllergyDetailedSummary patient={patient} showAddAllergyButton={showAddAllergyButton} />}
          />
        </Switch>
      </BrowserRouter>
    </AllergiesContext.Provider>
  );
}
