import { OBSERVATION_INTERPRETATION } from "./helpers";

export type ConceptUuid = string;
export type ObsUuid = string;

export interface ObsRecord {
  members?: ObsRecord[];
  conceptClass: ConceptUuid;
  meta?: ObsMetaInfo;
  effectiveDateTime: string;
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
  [_: string]: { entries: ObsRecord[]; type: "LabSet" | "Test"; uuid: string };
}
