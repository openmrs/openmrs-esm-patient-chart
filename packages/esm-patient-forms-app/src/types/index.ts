/**
 * The form encounter as it is fetched from the API.
 */
export interface FormEncounter {
  uuid: string;
  encounterType?: EncounterType;
  name: string;
  version: string;
  published: boolean;
  retired: boolean;
  resources: Array<{
    uuid: string;
    name: string;
    dataType: string;
    valueReference: string;
  }>;
}

/**
 * An encounter which references the form which created the encounter (by being filled out).
 */
export interface EncounterWithFormRef {
  uuid: string;
  encounterType?: EncounterType;
  encounterDatetime: string;
  form?: FormEncounter;
}

export interface EncounterType {
  uuid: string;
  name: string;
}

export interface ListResponse<T> {
  results: Array<T>;
}

export interface CompletedFormInfo {
  form: FormEncounter;
  associatedEncounters: Array<EncounterWithFormRef>;
  lastCompleted?: Date;
}
