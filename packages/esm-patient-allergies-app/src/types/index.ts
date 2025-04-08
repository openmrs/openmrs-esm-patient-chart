export interface FHIRAllergyResponse {
  entry: Array<{
    resource: FHIRAllergy;
  }>;
  id: string;
  meta: {
    lastUpdated: string;
  };
  resourceType: string;
  total: number;
  type: string;
}

export interface FHIRAllergy {
  category: Array<string>;
  clinicalStatus: {
    coding: Array<CodingData>;
    text: string;
  };
  code: {
    coding: Array<CodingData>;
    text: string;
  };
  criticality: string;
  id: string;
  meta?: {
    lastUpdated: string;
  };
  note?: [
    {
      text: string;
    },
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
  reaction: Array<AllergicReaction>;
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

export interface AllergicReaction {
  manifestation: Array<{
    coding: CodingData;
    text: string;
  }>;
  severity: ReactionSeverity;
  substance: {
    coding: Array<CodingData>;
    text: string;
  };
}

export const REACTION_SEVERITY = {
  MILD: 'mild',
  MODERATE: 'moderate',
  SEVERE: 'severe',
} as const;

export type ReactionSeverity = (typeof REACTION_SEVERITY)[keyof typeof REACTION_SEVERITY];

export interface CodingData {
  code: string;
  display: string;
  extension?: Array<ExtensionData>;
  system?: string;
}

export interface OpenMRSResource {
  uuid: string;
  display: string;
}

export const ALLERGEN_TYPES = {
  DRUG: 'DRUG',
  FOOD: 'FOOD',
  ENVIRONMENT: 'ENVIRONMENT',
  OTHER: 'OTHER',
} as const;

export type AllergenType = (typeof ALLERGEN_TYPES)[keyof typeof ALLERGEN_TYPES];
