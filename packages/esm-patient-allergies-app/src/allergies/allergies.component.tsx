import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import AllergyDetailedSummary from "./allergies-detailed-summary.component";
import { AllergiesContext } from "./allergies.context";
import AllergyRecord from "./allergy-record.component";

interface AllergiesProps {
  basePath: string;
  patient: fhir.Patient;
  patientUuid: string;
}

export default function Allergies({
  basePath,
  patient,
  patientUuid
}: AllergiesProps) {
  return (
    <AllergiesContext.Provider value={{ patientUuid, patient }}>
      <BrowserRouter basename={`${basePath}/allergies`}>
        <Switch>
          <Route exact path="/" component={AllergyDetailedSummary} />
          <Route exact path="/details/:allergyUuid" component={AllergyRecord} />
        </Switch>
      </BrowserRouter>
    </AllergiesContext.Provider>
  );
}
