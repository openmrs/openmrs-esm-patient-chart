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
  sequenceLabel?: string;
  sequenceNumber?: string | number;
  formChanged?: any;
}

export interface Sequence {
  sequenceLabel: string;
  sequenceNumber: string | number;
}

export interface ExistingDoses {
  expirationDate: string | Date;
  immunizationObsUuid: string;
  lotNumber: string;
  manufacturer: string;
  sequenceLabel: string | null;
  sequenceNumber: string | number;
  occurrenceDateTime: string | Date;
}
