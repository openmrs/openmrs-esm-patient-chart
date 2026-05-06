export type ConceptReference = {
  uuid: string;
  display: string;
};

export type PatientReference = {
  uuid: string;
  display: string;
};

export type ProcedureType = {
  uuid: string;
  name: string;
};

export interface RawProcedure {
  patient: string;
  procedureCoded?: string;
  procedureType?: string;
  bodySite?: string;
  startDateTime?: string;
  endDateTime?: string;
  status?: string;
  notes?: string;
  duration?: number;
  durationUnit?: string;
}

export type Procedure = {
  uuid: string;
  display: string;
  patient: PatientReference;
  procedureType: ProcedureType;
  procedureCoded: ConceptReference;
  procedureNonCoded: string;
  bodySite: ConceptReference;
  startDateTime: string;
  estimatedStartDate: string;
  endDateTime: string;
  duration: number;
  durationUnit: ConceptReference;
  status: ConceptReference;
  outcomeCoded: ConceptReference;
  outcomeNonCoded: ConceptReference;
  notes: string;
  formNamespaceAndPath: string;
  voided: boolean;
};

export interface ProcedureApiResponse {
  results: Array<Procedure>;
  links: Array<{ rel: string; uri: string }>;
}

export interface ProcedureTypeApiResponse {
  results: Array<ProcedureType>;
}
