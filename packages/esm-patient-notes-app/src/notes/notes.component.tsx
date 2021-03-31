import React from "react";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import NotesDetailedSummary from "./notes-detailed-summary.component";
import NoteRecord from "./note-record.component";

interface NotesProps {
  basePath: string;
}

export default function Notes({ basePath }: NotesProps) {
  const root = `${basePath}/encounters/notes`;
  return (
    <BrowserRouter basename={root}>
      <Switch>
        <Route exact path="/" component={NotesDetailedSummary} />
        <Route exact path="/:encounterUuid" component={NoteRecord} />
      </Switch>
    </BrowserRouter>
  );
}
