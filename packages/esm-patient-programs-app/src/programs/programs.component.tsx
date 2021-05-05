import React from 'react';
import ProgramsDetailedSummary from './programs-detailed-summary.component';
import ProgramRecord from './program-record.component';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import { ProgramsContext } from './programs.context';

interface ProgramsProps {
  basePath: string;
  patient: fhir.Patient;
  patientUuid: string;
}

export default function Programs({ basePath, patient, patientUuid }: ProgramsProps) {
  return (
    <ProgramsContext.Provider value={{ patientUuid, patient }}>
      <BrowserRouter basename={`${window.spaBase}${basePath}/programs`}>
        <Switch>
          <Route exact path="/" component={ProgramsDetailedSummary} />
          <Route exact path="/:programUuid" component={ProgramRecord} />
        </Switch>
      </BrowserRouter>
    </ProgramsContext.Provider>
  );
}
