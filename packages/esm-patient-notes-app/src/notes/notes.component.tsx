import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import NotesDetailedSummary from './notes-detailed-summary.component';
import { NotesContext } from './notes.context';

interface NotesProps {
  basePath: string;
  patient: fhir.Patient;
  patientUuid: string;
  showAddNote: boolean;
}

export default function Notes({ basePath, patient, patientUuid, showAddNote }: NotesProps) {
  return (
    <NotesContext.Provider value={{ patient, patientUuid }}>
      <BrowserRouter basename={`${window.spaBase}${basePath}/encounters/notes`}>
        <Switch>
          <Route
            exact
            path="/"
            render={() => (
              <NotesDetailedSummary patientUuid={patientUuid} showAddNote={showAddNote} basePath={basePath} />
            )}
          />
        </Switch>
      </BrowserRouter>
    </NotesContext.Provider>
  );
}
