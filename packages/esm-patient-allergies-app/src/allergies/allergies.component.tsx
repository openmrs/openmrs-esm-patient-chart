import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import AllergyDetailedSummary from "./allergies-detailed-summary.component";
import AllergyRecord from "./allergy-record.component";

interface AllergiesProps {
  basePath: string;
}

export default function Allergies({ basePath }: AllergiesProps) {
  const root = `${basePath}/allergies`;
  return (
    <BrowserRouter basename={root}>
      <Switch>
        <Route exact path="/" component={AllergyDetailedSummary} />
        <Route exact path="/details/:allergyUuid" component={AllergyRecord} />
      </Switch>
    </BrowserRouter>
  );
}
