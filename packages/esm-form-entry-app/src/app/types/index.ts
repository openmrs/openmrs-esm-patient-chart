import { Form } from '@openmrs/ngx-formentry';

interface OpenmrsResource {
  display: string;
  uuid: string;
  links?: Array<{ rel: string; uri: string }>;
}
/**
 * The form encounter as it is fetched from the REST API.
 */
export interface FormEncounter {
  uuid: string;
  name: string;
  display: string;
  version: string;
  published: boolean;
  retired: boolean;
  resources: Array<FormEncounterResource>;
}

export interface FormEncounterResource {
  uuid: string;
  name: string;
  dataType: string;
  valueReference: string;
}

export interface EncounterProvider {
  uuid: string;
  display: string;
  encounterRole: {
    uuid: string;
    display: string;
  };
  provider: {
    uuid: string;
    person: {
      uuid: string;
      display: string;
    };
  };
}

export interface Observation {
  uuid: string;
  concept: {
    uuid: string;
    display: string;
    conceptClass: {
      uuid: string;
      display: string;
    };
  };
  display: string;
  groupMembers: null | Array<{
    uuid: string;
    concept: {
      uuid: string;
      display: string;
    };
    value: {
      uuid: string;
      display: string;
    };
  }>;
  value: any;
  obsDatetime: string;
}

export interface Order {
  uuid: string;
  dateActivated: string;
  dose: number;
  doseUnits: {
    uuid: string;
    display: string;
  };
  orderNumber: number;
  display: string;
  drug: {
    uuid: string;
    name: string;
    strength: string;
  };
  duration: number;
  durationUnits: {
    uuid: string;
    display: string;
  };
  frequency: {
    uuid: string;
    display: string;
  };
  numRefills: number;
  orderer: {
    uuid: string;
    person: {
      uuid: string;
      display: string;
    };
  };
  orderType: {
    uuid: string;
    display: string;
  };
  route: {
    uuid: string;
    display: string;
  };
  auditInfo: {
    dateVoided: string;
  };
}

export interface Diagnosis {
  uuid: string;
  display: string;
  diagnosis: {
    coded?: {
      uuid: string;
      display?: string;
    };
    nonCoded?: string;
  };
  certainty: string;
  rank: number;
}

export interface FormSchema {
  auditInfo: {
    dateCreated: string;
    dateChanged: string;
    changedBy: OpenmrsResource;
    creator: OpenmrsResource;
  };
  build: string;
  description: string;
  display: string;
  encounterType: OpenmrsResource;
  formField: Array<unknown>;
  name: string;
  pages: Array<{ label: string; sections: Array<Sections> }>;
  processor: string;
  published: boolean;
  referencedForms: Array<unknown>;
  resourceVersion: string;
  retired: boolean;
  translations?: Record<string, string>;
  uuid: string;
  version: string;
}

export interface FormMetadataObject {
  display: string;
  resources: Array<{ name: string; valueReference: string }>;
}

export interface FormSchemaAndTranslations extends FormSchema {
  translations?: Record<string, string>;
}

export interface PreFilledQuestions {
  [key: string]: string;
}

interface Sections {
  isExpanded: boolean;
  label: string;
  questions: Array<Questions>;
}

export interface Questions {
  id: string;
  default: string;
  questionOptions?: QuestionOptions;
  required: boolean;
  type: string;
  validators: Array<Validators>;
  label?: string;
  concept?: string;
  questions?: Array<Questions>;
}

interface QuestionOptions {
  rendering: string;
  concept?: string;
  answers?: Array<QuestionOptionsAnswer>;
  useMostRecentValue: boolean | 'true';
}

interface QuestionOptionsAnswer {
  concept?: string;
  label?: string;
}

interface Validators {
  type: string;
}

export interface LoggedInUser {
  user: any;
  currentProvider: {
    uuid: string;
    display: string;
    identifier: string;
  };
  sessionLocation: {
    uuid: string;
    name: string;
    display: string;
  };
}

export interface MonthlyScheduleParams {
  endDate: string;
  limit: number;
  locationUuids: string;
  programType: string;
  startDate: string;
}

export interface FormEntryConfig {
  /** @deprecated use customDataSources instead */
  dataSources: {
    /** @deprecated should be converted to customDataSource */
    monthlySchedule: boolean;
  };
  customDataSources: {
    name: string;
    moduleName: string;
    moduleExport: 'default' | string;
  }[];
  appointmentsResourceUrl: string;
  customEncounterDatetime: boolean;
}

export interface ListResult<T> {
  results: Array<T>;
}

export interface Location {
  uuid: string;
  display: string;
}

export interface Provider {
  uuid: string;
  display: string;
  person?: {
    uuid: string;
  };
}

export interface Concept {
  uuid: string;
  name: {
    display: string;
  };
  conceptClass: {
    uuid: string;
  };
  answers: Array<Concept>;
  setMembers: Array<Concept>;
  display: string;
}

export interface Visit {
  uuid: string;
  startDatetime: string;
  stopDatetime?: string;
}

export interface Encounter {
  uuid: string;
  encounterDatetime: string;
  encounterProviders: Array<{
    uuid: string;
    display: string;
    encounterRole: {
      uuid: string;
      display: string;
    };
    provider: {
      uuid: string;
      person: {
        uuid: string;
        display: string;
      };
    };
  }>;
  encounterType: {
    uuid: string;
    display: string;
  };
  visit?: Visit;
  obs: Array<Observation>;
  orders: Array<Order>;
  diagnoses: Array<Diagnosis>;
  patient: OpenmrsResource;
  location: OpenmrsResource;
}

/** https://rest.openmrs.org/?shell#create-an-encounter */
export interface EncounterCreate {
  uuid?: string;
  encounterDatetime: string;
  patient: string;
  encounterType: string;
  location: string;
  encounterProviders?: Array<ProviderCreate>;
  obs?: Array<ObsCreate>;
  orders?: Array<OrderCreate>;
  diagnoses?: Array<DiagnosisCreate>;
  form?: string;
  visit?: string;
}

export interface ProviderCreate {
  uuid?: string;
  person: string;
  provider: string;
}

export interface ObsCreate {
  uuid?: string;
  person: string;
  obsDateTime: Date | string;
  concept: string;
  location?: string;
  order?: string;
  encounter?: string;
  accessionNumber?: string;
  groupMembers?: Array<ObsCreate>;
  comment?: string;
  value: string;
  status?: 'PRELIMINARY' | 'FINAL' | 'AMENDED';
  valueCodedName?: string;
  interpretation?:
    | 'NORMAL'
    | 'ABNORMAL'
    | 'CRITICALLY_ABNORMAL'
    | 'NEGATIVE'
    | 'POSITIVE'
    | 'CRITICALLY_LOW'
    | 'LOW'
    | 'HIGH'
    | 'CRITICALLY_HIGH'
    | 'VERY_SUSCEPTIBLE'
    | 'SUSCEPTIBLE'
    | 'INTERMEDIATE'
    | 'RESISTANT'
    | 'SIGNIFICANT_CHANGE_DOWN'
    | 'SIGNIFICANT_CHANGE_UP'
    | 'OFF_SCALE_LOW'
    | 'OFF_SCALE_HIGH';
  voided?: boolean;
}

export interface OrderCreate {
  uuid?: string;
  encounter: string;
  orderType: string;
  action: 'NEW' | 'REVISE' | 'DISCONTINUE' | 'RENEW';
  accessionNumber?: string;
  patient: string;
  concept: string;
  careSetting: string;
  previousNumber?: string;
  instructions: string;
  urgency: 'ROUTINE' | 'STAT' | 'ON_SCHEDULED_DATE';
  dateActivated?: Date | string;
  dateStopped?: Date | string;
  // TODO: Fill as required.
}

export interface DiagnosisCreate {
  uuid?: string;
  encounter: string;
  patient: string;
  diagnosis: {
    coded?: string;
    nonCoded?: string;
  };
  certainty: 'CONFIRMED' | 'PROVISIONAL';
  rank: number;
}

export interface Person {
  uuid: string;
  attributes: Array<PersonAttribute>;
}

export interface PersonAttribute {
  attributeType: string;
  value: string;
}

export interface PersonUpdate {
  uuid?: string;
  attributes: Array<PersonAttribute>;
}

export interface PatientProgram {
  uuid: string;
  patient?: OpenmrsResource;
  program: {
    uuid: string;
    name: string;
    allWorkflows: Array<{
      uuid: string;
      concept: OpenmrsResource;
      retired: boolean;
      states: Array<{}>;
      links?: OpenmrsResource;
    }>;
    concept: {
      display: string;
      uuid: string;
    };
    links: OpenmrsResource;
  };
  display: string;
  dateEnrolled: string;
  dateCompleted: string | null;
  location?: {
    uuid: string;
    display: string;
    links: OpenmrsResource;
  };
  voided?: boolean;
  outcome?: null;
  states?: [];
  links: OpenmrsResource;
  resourceVersion?: string;
}

export interface MetaData {
  isEnrollment: boolean;
  uuid: string;
  discontinuationDateQuestionId: string;
  enrollmentDateQuestionId: string;
}

export interface Identifier {
  uuid?: string;
  identifier: string;
  identifierType: OpenmrsResource;
  location: OpenmrsResource;
}

export interface PatientModel {
  sex: string;
  birthdate: Date;
  age: number;
  gendercreatconstant?: number;
  identifiers: Array<Identifier>;
  patientUuid: string;
  [key: string]: any;
}

export interface IdentifierPayload {
  newIdentifiers: Array<any>;
  currentIdentifiers: Array<any>;
}

type FieldError = {
  [key: string]: Array<{ code: string; message: string }>;
};
export type ErrorObject = {
  error: {
    code: string;
    message: string;
    detail: string;
    fieldErrors?: FieldError;
    globalErrors?: FieldError;
  };
};
