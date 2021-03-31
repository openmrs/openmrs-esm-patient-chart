import React from "react";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import ConditionsDetailedSummary from "./conditions-detailed-summary.component";
import ConditionRecord from "./condition-record.component";

interface ConditionsProps {
  basePath: string;
}

export default function Conditions({ basePath }: ConditionsProps) {
  const root = `${basePath}/conditions`;

  return (
    <BrowserRouter basename={root}>
      <Switch>
        <Route exact path="/" component={ConditionsDetailedSummary} />
        <Route exact path="/:conditionUuid" component={ConditionRecord} />
      </Switch>
    </BrowserRouter>
  );
}
