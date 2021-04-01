import React from "react";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import ProgramsDetailedSummary from "./programs-detailed-summary.component";
import ProgramRecord from "./program-record.component";

interface ProgramsProps {
  basePath: string;
}

export default function Programs({ basePath }: ProgramsProps) {
  const root = `${basePath}/programs/details`;

  return (
    <BrowserRouter basename={root}>
      <Switch>
        <Route exact path="/" component={ProgramsDetailedSummary} />
        <Route exact path="/:programUuid" component={ProgramRecord} />
      </Switch>
    </BrowserRouter>
  );
}
