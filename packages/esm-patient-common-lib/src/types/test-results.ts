export type ConceptUuid = string;
export type ObsUuid = string;

export interface ObsRecord {
  members?: Array<ObsRecord>;
  conceptClass: ConceptUuid;
  meta?: ObsMetaInfo;
  effectiveDateTime: string;
  encounter: {
    reference: string;
    type: string;
  };
  // Index signature allows arbitrary FHIR Observation fields
  [_: string]: string | number | boolean | null | undefined | object | Array<unknown>;
}

export interface ObsMetaInfo {
  assessValue?: (value: string) => OBSERVATION_INTERPRETATION;
  // Additional metadata fields from the test results viewer
  [_: string]: string | number | boolean | null | undefined | ((value: string) => OBSERVATION_INTERPRETATION);
}

export interface ConceptRecord {
  uuid: ConceptUuid;
  display?: string;
  datatype?: string;
  // Index signature allows arbitrary concept fields from the FHIR concept dictionary
  [_: string]: string | number | boolean | null | undefined | object | Array<unknown>;
}

export interface PatientData {
  [_: string]: {
    entries: Array<ObsRecord>;
    type: 'LabSet' | 'Test';
    uuid: string;
  };
}

export type OBSERVATION_INTERPRETATION =
  | 'NORMAL'
  | 'HIGH'
  | 'CRITICALLY_HIGH'
  | 'OFF_SCALE_HIGH'
  | 'LOW'
  | 'CRITICALLY_LOW'
  | 'OFF_SCALE_LOW'
  // Legacy sentinel for "no data"; avoid new usage and prefer undefined instead.
  | '--';

export interface ReferenceRanges {
  hiAbsolute?: number;
  hiCritical?: number;
  hiNormal?: number;
  lowAbsolute?: number;
  lowCritical?: number;
  lowNormal?: number;
  units?: string;
}

export interface ExternalOverviewProps {
  patientUuid: string;
  filter: (filterProps: PanelFilterProps) => boolean;
}

export type PanelFilterProps = [ObsRecord, string, string, string];
