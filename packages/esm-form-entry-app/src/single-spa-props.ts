import { ReplaySubject } from 'rxjs';
import { AppProps } from 'single-spa';
import { Encounter, EncounterCreate } from './app/types';

export const singleSpaPropsSubject = new ReplaySubject<SingleSpaProps>(1);
// Visit Details
type VisitDetails = {
  formUuid: string;
  visitTypeUuid?: string;
  encounterUuid?: string;
  visitUuid?: string;
  visitStartDatetime: string;
  visitStopDatetime: string;
};

// Callback Handlers
type Callbacks = {
  handleEncounterCreate?: (encounter: EncounterCreate) => void;
  handlePostResponse?: (encounter: Encounter) => void;
  handleOnValidate?: (valid: boolean) => void;
};

// View & UI Control
type UIViewControls = {
  view: string;
  closeWorkspace: () => void;
  showDiscardSubmitButtons?: boolean;
  currentVisitIsRetrospective?: boolean;
};

// Patient Details
type PatientDetails = {
  patient: any;
  patientUuid: string;
  isOffline: boolean;
};

// Add any custom single-spa props you have to this type def
// https://single-spa.js.org/docs/building-applications.html#custom-props
export type SingleSpaProps = AppProps & VisitDetails & Callbacks & UIViewControls & PatientDetails;
