import { ReplaySubject } from 'rxjs';
import { AppProps } from 'single-spa';
import { Encounter } from './app/types';

export const singleSpaPropsSubject = new ReplaySubject<SingleSpaProps>(1);

// Add any custom single-spa props you have to this type def
// https://single-spa.js.org/docs/building-applications.html#custom-props
export type SingleSpaProps = AppProps & {
  formUuid: string;
  visitTypeUuid?: string;
  encounterUuid?: string;
  visitUuid?: string;
  view: string;
  closeWorkspace: () => void;
  patient: any;
  isOffline: boolean;
  patientUuid: string;
  handlePostResponse?: (encounter: Encounter) => void;
  showDiscardSubmitButtons?: boolean;
};
