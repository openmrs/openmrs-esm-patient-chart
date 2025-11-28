export interface Procedure {
  id: string;
  procedureName: string;
  date: string;
  year: string;
  status?: string;
  recordedDate?: string;
  recordedBy?: string;
  note?: string;
}

export interface ProcedureObservation {
  uuid: string;
  concept: {
    uuid: string;
    display: string;
  };
  value?: string;
  valueDatetime?: string;
  obsDatetime: string;
  person: {
    uuid: string;
    display: string;
  };
  comment?: string;
}

export interface ProcedureFormData {
  procedureName: string;
  procedureDate: Date;
  status?: string;
  comments?: string;
}

export interface UseProcedures {
  procedures: Procedure[] | null;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
  mutate: () => void;
}
