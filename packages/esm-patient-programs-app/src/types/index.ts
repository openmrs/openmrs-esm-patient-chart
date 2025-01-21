export interface ProgramsFetchResponse {
  results: Array<PatientProgram>;
}

export interface PatientProgram {
  uuid: string;
  patient?: DisplayMetadata;
  program: Program;
  display: string;
  dateEnrolled: string;
  dateCompleted: string | null;
  location?: {
    uuid: string;
    display: string;
    links?: Links;
  };
  voided?: boolean;
  outcome?: null;
  states?: ProgramWorkflowState[];
  links?: Links;
  resourceVersion?: string;
}

export interface ProgramWorkflowState {
  state: {
    uuid: string;
    concept: DisplayMetadata;
  };
  startDate: string;
  endDate: string;
  voided: boolean;
}

export type Links = Array<{
  rel: string;
  uri: string;
}>;

export interface DisplayMetadata {
  display?: string;
  links?: Links;
  uuid?: string;
}

export interface DataCaptureComponentProps {
  entryStarted: () => void;
  entrySubmitted: () => void;
  entryCancelled: () => void;
  closeComponent: () => void;
}
export interface Program {
  uuid: string;
  display: string;
  name: string;
  allWorkflows: Array<{
    uuid: string;
    concept: DisplayMetadata;
    retired: boolean;
    states: Array<{
      uuid: string;
      concept: DisplayMetadata;
    }>;
    links?: Links;
  }>;
  concept: {
    uuid: string;
    display: string;
  };
  links?: Links;
}

export interface LocationData {
  display: string;
  uuid: string;
}

export interface SessionData {
  authenticated: boolean;
  locale: string;
  currentProvider: {
    uuid: string;
    display: string;
    person: DisplayMetadata;
    identifier: string;
    attributes: Array<{}>;
    retired: boolean;
    links: Links;
    resourceVersion: string;
  };
  sessionLocation: {
    uuid: string;
    display: string;
    name: string;
    description?: string;
  };
  user: {
    uuid: string;
    display: string;
    username: string;
  };
  privileges: Array<DisplayMetadata>;
  roles: Array<DisplayMetadata>;
  retired: false;
  links: Links;
}

export interface ConfigurableProgram extends PatientProgram {
  uuid: string;
  display: string;
  enrollmentFormUuid: string;
  discontinuationFormUuid: string;
  enrollmentStatus: string;
  dateEnrolled: string;
  dateCompleted: string;
}
