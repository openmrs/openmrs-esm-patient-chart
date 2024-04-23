import { ReplaySubject } from 'rxjs';
import { AppProps } from 'single-spa';
import { Encounter, EncounterCreate } from './app/types';
import { type DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';

export const singleSpaPropsSubject = new ReplaySubject<SingleSpaProps>(1);

type VisitProperties = {
  visitTypeUuid?: string;
  visitUuid?: string;
  visitStartDatetime: string;
  visitStopDatetime: string;
};

type EncounterProperties = {
  encounterUuid?: string;
  handleEncounterCreate?: (encounter: EncounterCreate) => void;
  handlePostResponse?: (encounter: Encounter) => void;
};

type PatientProperties = {
  patient: any;
  patientUuid: string;
};

type UIBehavior = {
  view: string;
  closeWorkspace: DefaultWorkspaceProps['closeWorkspace'];
  closeWorkspaceWithSavedChanges: DefaultWorkspaceProps['closeWorkspaceWithSavedChanges'];
  promptBeforeClosing: DefaultWorkspaceProps['promptBeforeClosing'];
  handleOnValidate?: (valid: boolean) => void;
  showDiscardSubmitButtons?: boolean;
};

type ApplicationStatus = {
  isOffline: boolean;
};

type Form = {
  formUuid: string;
};

type PreFilledQuestions = {
  [key: string]: string;
};

// Add any custom single-spa props you have to this type def
// https://single-spa.js.org/docs/building-applications.html#custom-props
export type SingleSpaProps = AppProps &
  Form &
  UIBehavior &
  VisitProperties &
  EncounterProperties &
  PatientProperties &
  PreFilledQuestions &
  ApplicationStatus & {
    additionalProps?: any;
  };
