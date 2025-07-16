/**
 * My interfaces
 */
export interface FormsDashboardConfig {
  sections: Array<SectionConfig>;
}

export interface SectionConfig {
  name: string;
  labelCode: string;
  encounters: Array<{
    id: string;
    uuid: string;
    display: string;
    lastCompletedDate: string;
    formUuid: string;
  }>;
}

/**
 * The form encounter as it is fetched from the API.
 */
export interface Form {
  uuid: string;
  encounterType?: EncounterType;
  name: string;
  display?: string;
  version: string;
  published: boolean;
  retired: boolean;
  resources: Array<FormEncounterResource>;
  formCategory?: string;
}

/**
 * The resource part of a form encounter.
 */
export interface FormEncounterResource {
  uuid: string;
  name: string;
  dataType: string;
  valueReference: string;
}

/**
 * An encounter which references the form which created the encounter (by being filled out).
 */
export interface EncounterWithFormRef {
  uuid: string;
  encounterType?: EncounterType;
  encounterDatetime: string;
  form?: Form;
}

export interface Privilege {
  uuid: string;
  name: string;
  display?: string;
  description?: string;
}

export interface EncounterType {
  uuid: string;
  name: string;
  viewPrivilege: Privilege | null;
  editPrivilege: Privilege | null;
}

export interface ListResponse<T> {
  results: Array<T>;
}

export interface CompletedFormInfo {
  form: Form;
  associatedEncounters: Array<EncounterWithFormRef>;
  lastCompletedDate?: Date;
}

export interface FormsSection {
  name: string;
  labelCode: string;
  completedFromsInfo: Array<CompletedFormInfo>;
}
