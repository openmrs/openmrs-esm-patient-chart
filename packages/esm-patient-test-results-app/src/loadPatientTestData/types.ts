import { OBSERVATION_INTERPRETATION } from './helpers';

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
  [_: string]: any;
}

export interface ObsMetaInfo {
  [_: string]: any;
  assessValue?: (value: number) => OBSERVATION_INTERPRETATION;
}

export interface ConceptRecord {
  uuid: ConceptUuid;
  [_: string]: any;
}

export interface PatientData {
  [_: string]: {
    entries: Array<ObsRecord>;
    type: 'LabSet' | 'Test';
    uuid: string;
  };
}
