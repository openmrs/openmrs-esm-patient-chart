export interface DataCaptureComponentProps {
  entryStarted: () => void;
  entrySubmitted: () => void;
  entryCancelled: () => void;
  closeComponent: () => void;
}

export interface Immunization {
  sequences?: Array<Sequence>;
  existingDoses: Array<ExistingDoses>;
  vaccineName: string;
  vaccineUuid: string;
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
