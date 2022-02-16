export interface EncountersFetchResponse {
  results: Array<RESTPatientNote>;
}

export interface RESTPatientNote {
  uuid: string;
  display: string;
  encounterDatetime: string;
  location: { uuid: string; display: string; name: string };
  encounterType: { name: string; uuid: string };
  auditInfo: {
    creator: any;
    uuid: string;
    display: string;
    links: any;
    dateCreated: Date;
    changedBy?: any;
    dateChanged?: Date;
  };
  encounterProviders: [{ provider: { person: { display: string } } }];
  obs: Array<ObsData>;
}

export interface PatientNote {
  id: string;
  diagnoses: string;
  encounterDate: string;
  encounterNote: string;
  encounterNoteRecordedAt: string;
}

export interface DiagnosisData {
  word: null;
  conceptName: {
    id: number;
    uuid: string;
    conceptNameType: string;
    name: string;
  };
  concept: {
    id: number;
    uuid: string;
    conceptMappings: Array<ConceptMapping>;
    preferredName: string;
  };
}

export interface ConceptMapping {
  conceptMapType: string;
  conceptReferenceTerm: {
    code: string;
    name: null | string;
    conceptSource: {
      name: string;
    };
  };
}

export interface DisplayMetadata {
  display?: string;
  links?: Links;
  uuid?: string;
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

export type Links = Array<{
  rel: string;
  uri: string;
}>;

export interface Provider {
  uuid: string;
  display: string;
  person: {
    uuid: string;
    display: string;
    links: Links;
  };
  identifier: string;
  attributes: Array<any>;
  retired: boolean;
  links: Links;
  resourceVersion: string;
}

export interface Location {
  uuid: string;
  display: string;
  name: string;
  description?: string;
  address1?: string;
  address2?: string;
  cityVillage?: string;
  stateProvince?: string;
  country?: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
  countryDistrict?: string;
  address3?: string;
  address4?: string;
  address5?: string;
  address6?: string;
}

export interface ObsData {
  concept: {
    display: string;
    uuid: string;
  };
  value?: string | any;
  groupMembers?: Array<{
    concept: { uuid: string; display: string };
    value?: string | any;
  }>;
  obsDatetime: string;
}

export interface Diagnosis {
  concept: any;
  conceptReferenceTermCode: string;
  primary: boolean;
  confirmed: boolean;
}

export interface VisitNotePayload {
  encounterDatetime: string; // date and time the encounter was created (ISO8601 Long) (REQUIRED)
  encounterType: string; // uuid of the encounter type - initial visit, return visit etc. (REQUIRED)
  patient: string; // the patient to whom the encounter applies
  location: string; // the location at which the encounter occurred (REQUIRED)
  encounterProviders: Array<{ encounterRole: string; provider: string }>; // array of providers and their role within the encounter. At least 1 provider is required
  obs: Array<ObsPayload>; // array of observations and values for the encounter
  form: string; // target form uuid to be filled for the encounter
  orders?: Array<any>; // list of orders created during the encounter
  visit?: string; // when creating an encounter for a specific visit, this specifies the visit
}

export interface ObsPayload {
  concept: string;
  value?: string;
  groupMembers?: Array<{
    concept: string;
    value: string;
  }>;
}
