import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import AllergyDetailedSummary from './allergies-detailed-summary.component';
import { AllergiesContext } from './allergies.context';

interface AllergiesProps {
  basePath: string;
  patient: fhir.Patient;
  patientUuid: string;
  showAddAllergy: boolean;
}

export default function Allergies({ basePath, patient, patientUuid, showAddAllergy }: AllergiesProps) {
  return (
    <AllergiesContext.Provider value={{ patientUuid, patient }}>
      <BrowserRouter basename={`${window.spaBase}${basePath}/allergies`}>
        <Switch>
          <Route
            exact
            path="/"
            render={() => <AllergyDetailedSummary patient={patient} showAddAllergy={showAddAllergy} />}
          />
        </Switch>
      </BrowserRouter>
    </AllergiesContext.Provider>
  );
}
