export interface DataCaptureComponentProps {
  entryStarted: () => void;
  entrySubmitted: () => void;
  entryCancelled: () => void;
  closeComponent: () => void;
}

export interface FHIRAllergy {
  category: Array<string>;
  clinicalStatus: {
    coding: Array<CodingData>;
    text: string;
  };
  code: {
    coding: Array<CodingData>;
  };
  criticality: string;
  id: string;
  meta?: {
    lastUpdated: string;
  };
  note?: [
    {
      text: string;
    }
  ];
  patient: {
    display: string;
    identifier: {
      id: string;
      system: string;
      use: string;
      value: string;
    };
    reference: string;
    type: string;
  };
  reaction: Array<FHIRAllergicReaction>;
  recordedDate: string;
  recorder: {
    display: string;
    reference: string;
    type: string;
  };
  resourceType: string;
  text: {
    div: string;
    status: string;
  };
  type: string;
}

export interface ExtensionData {
  extension: [];
  url: string;
}

export interface FHIRAllergicReaction {
  manifestation: Array<FHIRAllergyManifestation>;
  severity: string;
  substance: {
    coding: Array<CodingData>;
  };
}

export interface FHIRAllergyManifestation {
  coding: CodingData;
}

export interface CodingData {
  code: string;
  display: string;
  extension?: Array<ExtensionData>;
  system?: string;
}

export interface AllergyData {
  allergen: {
    allergenType: string;
    codedAllergen: {
      answers: [];
      attrributes: [];
      conceptClass: DisplayMetadata;
      display: string;
      links: Links;
      mappings: Array<DisplayMetadata>;
      name: {
        conceptNameType: string;
        display: string;
        locale: string;
        name: string;
        uuid: string;
      };
      names: Array<DisplayMetadata>;
      setMembers: [];
      uuid: string;
    };
  };
  auditInfo: {
    changedBy: DisplayMetadata;
    creator: DisplayMetadata;
    dateCreated: string;
    dateChanged: string;
  };
  comment: string;
  display: string;
  links: Links;
  reactions: [
    {
      reaction: AllergicReaction;
    }
  ];
  severity: {
    name: {
      conceptNameType: string;
      display: string;
      locale: string;
      name: string;
      uuid: string;
    };
    names: Array<DisplayMetadata>;
    uuid: string;
  };
}

export type Allergen = {
  answers: [];
  attributes: [];
  conceptClass: DisplayMetadata;
  dataType: DisplayMetadata;
  descriptions: [];
  display: string;
  links: Links;
  mappings: Array<DisplayMetadata>;
  name: {
    display: string;
    links: Links;
    uuid: string;
    conceptTypeName?: string;
    locale: string;
    localePreferred: boolean;
    name: string;
    resourceVersion: string;
  };
  names: Array<DisplayMetadata>;
  setMembers: [];
  uuid: string;
};

export type AllergicReaction = {
  answers: [];
  attributes: [];
  conceptClass: DisplayMetadata;
  datatype: DisplayMetadata;
  descriptions: Array<DisplayMetadata>;
  name: {
    display: string;
  };
  display: string;
  uuid: string;
};

export type Links = Array<{
  rel: string;
  uri: string;
}>;

export interface DisplayMetadata {
  display?: string;
  links?: Links;
  uuid?: string;
}
