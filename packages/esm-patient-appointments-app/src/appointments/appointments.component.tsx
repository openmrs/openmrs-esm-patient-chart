import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import AppointmentsDetailedSummary from './appointments-detailed-summary.component';
import { AppointmentsContext } from './appointments.context';

interface AppointmentsProps {
  basePath: string;
  patient: fhir.Patient;
  patientUuid: string;
}

export default function Appointments({ basePath, patient, patientUuid }: AppointmentsProps) {
  return (
    <AppointmentsContext.Provider value={{ patientUuid, patient }}>
      <BrowserRouter basename={`${window.spaBase}${basePath}/appointments`}>
        <Switch>
          <Route exact path="/" component={AppointmentsDetailedSummary} />
        </Switch>
      </BrowserRouter>
    </AppointmentsContext.Provider>
  );
}
