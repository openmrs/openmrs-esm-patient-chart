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

export type FHIRImmunizationResource = {
  resourceType: 'Immunization';
  status: 'completed';
  id: string;
  vaccineCode: { coding: Array<Code> };
  patient: Reference;
  encounter: Reference;
  occurrenceDateTime: Date;
  expirationDate: Date;
  location: Reference;
  performer: Array<{ actor: Reference }>;
  manufacturer: { display: string };
  lotNumber: string;
  protocolApplied: [
    {
      doseNumberPositiveInt: number;
      series?: string;
    },
  ];
};
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
  vaccinesConceptSet: string;
  sequenceDefinitions: Array<ImmunizationSequenceDefinition>;
};

export type ImmunizationDoseData = {
  immunizationObsUuid: string;
  manufacturer: string;
  lotNumber: string;
  doseNumber: number;
  occurrenceDateTime: string;
  expirationDate: string;
  meta?: {
    encounterUuid?: string;
    location?: string;
  };
};

/*This represents a single consolidated immunization used on the UI with below details
- Vaccine name and uuid
- Existing doese given to patient for that vaccine
- Sequences configured for that vaccine
  */
export type ImmunizationData = {
  vaccineName: string;
  vaccineUuid: string;
  existingDoses: Array<ImmunizationDoseData>;
  sequences?: Array<ImmunizationSequence>;
};
