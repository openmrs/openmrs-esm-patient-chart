import { ReplaySubject } from 'rxjs';
import { AppProps } from 'single-spa';
import { Encounter, EncounterCreate } from './app/types';
import { DefaultWorkspaceProps, type Visit } from '@openmrs/esm-framework';

/**
 * Queue of per-instance subjects. Each call to `enqueueInstanceSubject` (from
 * bootstrap.ts) pushes a fresh ReplaySubject onto the queue before Angular
 * bootstraps a new module. Each `SingleSpaPropsService` constructor call
 * dequeues the front subject, binding that service instance to exactly the
 * props that were passed to *its* bootstrap call.
 *
 * This is safe because:
 * - JavaScript is single-threaded, so enqueue→bootstrap→dequeue is sequential.
 * - Angular's bootstrapModule resolves microtasks in FIFO order.
 * - Each Angular ApplicationRef (module instance) has its own service tree.
 */
const _instanceSubjectQueue: Array<ReplaySubject<SingleSpaProps>> = [];

/**
 * Called from bootstrap.ts once per parcel mount, immediately before
 * `platformBrowserDynamic().bootstrapModule(AppModule)`.
 */
export function enqueueInstanceSubject(props: SingleSpaProps): void {
  const subject = new ReplaySubject<SingleSpaProps>(1);
  subject.next(props);
  _instanceSubjectQueue.push(subject);
}

/**
 * Called from SingleSpaPropsService constructor during Angular module
 * initialisation. Returns the subject that belongs to this instance, or
 * `null` when the queue is empty (e.g. in unit tests).
 */
export function dequeueInstanceSubject(): ReplaySubject<SingleSpaProps> | null {
  return _instanceSubjectQueue.shift() ?? null;
}

/**
 * Queue of container DOM elements, one per in-flight bootstrap call.
 * Enqueued in bootstrap.ts before bootstrapModule; dequeued in
 * AppModule.ngDoBootstrap (which runs synchronously during module init).
 */
const _containerElementQueue: Array<HTMLElement | null> = [];

export function enqueueContainerElement(el: HTMLElement | null): void {
  _containerElementQueue.push(el);
}

export function dequeueContainerElement(): HTMLElement | null {
  return _containerElementQueue.shift() ?? null;
}

type VisitProperties = {
  visit?: Visit;
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
  closeWorkspace: () => void;
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
  } & Partial<DefaultWorkspaceProps>;
