export type OpenmrsConcept = {
  uuid: string;
  display: string;
  setMembers?: Array<OpenmrsConcept>;
  answers?: Array<OpenmrsConcept>;
};

export type Code = {
  code: string;
  system?: string;
  display: string;
};

export type Reference = {
  type: string;
  reference: string;
};

export interface FHIRImmunizationResource {
  resourceType: 'Immunization';
  status: 'completed';
  id?: string;
  vaccineCode: { coding: Array<Code> };
  patient: Reference;
  encounter: Reference;
  occurrenceDateTime: string;
  expirationDate?: string;
  extension?: Array<{
    url: string;
    valueDateTime: string;
  }>;
  note?: Array<{ text: string }>;
  location?: Reference;
  performer?: Array<{ actor: Reference }>;
  manufacturer?: { display: string };
  lotNumber?: string;
  protocolApplied?: Array<{ doseNumberPositiveInt: number; series?: string }>;
}

export type FHIRImmunizationBundleEntry = {
  fullUrl: string;
  resource: FHIRImmunizationResource;
};

export type FHIRImmunizationBundle = {
  resourceType: 'Bundle';
  entry: Array<FHIRImmunizationBundleEntry>;
};

export type ImmunizationSequence = {
  sequenceLabel: string;
  sequenceNumber: number;
};

export type ImmunizationSequenceDefinition = {
  vaccineConceptUuid: string;
  sequences: Array<ImmunizationSequence>;
};

export type ImmunizationWidgetConfigObject = {
  immunizationConceptSet: string;
  sequenceDefinitions: Array<ImmunizationSequenceDefinition>;
};
