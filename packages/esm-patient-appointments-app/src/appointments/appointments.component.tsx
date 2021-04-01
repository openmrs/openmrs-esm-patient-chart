import React from "react";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import AppointmentsDetailedSummary from "./appointments-detailed-summary.component";
import AppointmentRecord from "./appointment-record.component";

interface AppointmentsProps {
  basePath: string;
}

export default function Appointments({ basePath }: AppointmentsProps) {
  const root = `${basePath}/appointments`;

  return (
    <BrowserRouter basename={root}>
      <Switch>
        <Route exact path="/" component={AppointmentsDetailedSummary} />
        <Route exact path="/:appointmentUuid" component={AppointmentRecord} />
      </Switch>
    </BrowserRouter>
  );
}
