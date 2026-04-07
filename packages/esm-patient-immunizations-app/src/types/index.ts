export interface Immunization {
  sequences?: Array<Sequence>;
  existingDoses: Array<ExistingDoses>;
  vaccineName: string;
  vaccineUuid: string;
  immunizationObsUuid?: string;
  manufacturer?: string;
  nextDoseDate?: string;
  expirationDate?: string;
  occurrenceDateTime?: string;
  lotNumber?: string;
  doseNumber?: number;
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
  vaccinationDate: string;
  doseNumber: number;
  note: string;
  expirationDate: string;
  lotNumber: string;
  nextDoseDate: string;
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
  note: Array<{
    text: string;
  }>;
  visitUuid?: string;
  nextDoseDate: string;
  lotNumber: string;
  manufacturer: string;
  occurrenceDateTime: string;
  doseNumber: number;
}
