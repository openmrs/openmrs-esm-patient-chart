import React from "react";
import ConditionsDetailedSummary from "./conditions-detailed-summary.component";
import ConditionRecord from "./condition-record.component";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import { ConditionsContext } from "./conditions.context";

interface ConditionsProps {
  basePath: string;
  patient: fhir.Patient;
  patientUuid: string;
}

export default function Conditions({
  basePath,
  patientUuid,
  patient,
}: ConditionsProps) {
  return (
    <ConditionsContext.Provider value={{ patientUuid, patient }}>
      <BrowserRouter basename={`${basePath}/conditions`}>
        <Switch>
          <Route exact path="/" component={ConditionsDetailedSummary} />
          <Route exact path="/:conditionUuid" component={ConditionRecord} />
        </Switch>
      </BrowserRouter>
    </ConditionsContext.Provider>
  );
}
