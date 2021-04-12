import React from "react";
import NotesDetailedSummary from "./notes-detailed-summary.component";
import NoteRecord from "./note-record.component";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import { NotesContext } from "./notes.context";

interface NotesProps {
  basePath: string;
  patient: fhir.Patient;
  patientUuid: string;
}

export default function Notes({ basePath, patient, patientUuid }: NotesProps) {
  return (
    <NotesContext.Provider value={{ patient, patientUuid }}>
      <BrowserRouter basename={`${window.spaBase}${basePath}/encounters/notes`}>
        <Switch>
          <Route exact path="/" component={NotesDetailedSummary} />
          <Route exact path="/:encounterUuid" component={NoteRecord} />
        </Switch>
      </BrowserRouter>
    </NotesContext.Provider>
  );
}
