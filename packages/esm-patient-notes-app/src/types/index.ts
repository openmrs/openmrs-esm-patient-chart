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
