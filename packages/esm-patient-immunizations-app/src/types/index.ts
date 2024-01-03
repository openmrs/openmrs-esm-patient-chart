export interface Immunization {
  sequences?: Array<Sequence>;
  existingDoses: Array<ExistingDoses>;
  vaccineName: string;
  vaccineUuid: string;
  immunizationObsUuid?: string;
  manufacturer?: string;
  expirationDate?: string;
  occurrenceDateTime?: string;
  lotNumber?: string;
  doseNumber?: number;
  formChanged?: any;
}

export interface ImmunizationGrouped {
  vaccineName: string;
  vaccineUuid: string;
  existingDoses: Array<ExistingDoses>;
  sequences?: Array<Sequence>;
}

export interface ImmunizationFormState {
  vaccineUuid: string;
  immunizationId?: string;
  vaccinationDate: Date;
  doseNumber: number;
  expirationDate: Date;
  lotNumber: string;
  manufacturer: string;
  visitId?: string;
  locationId?: string;
  providers?: string[];
}

export interface ImmunizationFormData extends ImmunizationFormState {
  patientUuid: string;
  vaccineName: string;
}

export interface Sequence {
  sequenceLabel: string;
  sequenceNumber: string | number;
}

export interface ExistingDoses {
  expirationDate: string;
  immunizationObsUuid: string;
  visitUuid?: string;
  lotNumber: string;
  manufacturer: string;
  occurrenceDateTime: string;
  doseNumber: number;
}
