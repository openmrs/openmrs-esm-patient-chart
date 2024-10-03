import { type OpenmrsResource } from '@openmrs/esm-framework';
import { type ReactElement } from 'react';

export interface Encounter extends OpenmrsResource {
  encounterDatetime: Date;
  encounterType: { uuid: string; name: string };
  patient: {
    uuid: string;
    display: string;
    age: number;
    birthDate: string;
  };
  location: {
    uuid: string;
    display: string;
    name: string;
  };
  encounterProviders?: Array<{ encounterRole: string; provider: { uuid: string; name: string } }>;
  obs: Array<Observation>;
  form?: {
    uuid: string;
  };
  visit?: string;
}

export interface Observation {
  uuid: string;
  concept: { uuid: string; name: string };
  value:
    | {
        uuid: string;
        name: {
          name: string;
        };
        names?: Array<{ uuid: string; name: string; conceptNameType: string }>;
      }
    | string;
  groupMembers?: Array<Observation>;
  obsDatetime: string;
}

export interface ListResponse<T> {
  results: Array<T>;
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

export interface FormEncounterResource {
  uuid: string;
  name: string;
  dataType: string;
  valueReference: string;
}

export interface EncounterWithFormRef {
  uuid: string;
  encounterType?: EncounterType;
  encounterDatetime: string;
  form?: Form;
}

export interface CompletedFormInfo {
  form: Form;
  associatedEncounters: Array<EncounterWithFormRef>;
  lastCompleted?: Date;
}

export interface HtmlFormEntryForm {
  formUuid: string;
  formName: string;
  formUiResource: string;
  formUiPage: 'enterHtmlFormWithSimpleUi' | 'enterHtmlFormWithStandardUi';
  formEditUiPage: 'editHtmlFormWithSimpleUi' | 'editHtmlFormWithStandardUi';
}

export interface FormsSection {
  name: string;
  forms: Array<string>;
}

export interface ConfigObject {
  htmlFormEntryForms: Array<HtmlFormEntryForm>;
  formSections: Array<FormsSection>;
  customFormsUrl: string;
  orderBy: 'name' | 'most-recent';
  showHtmlFormEntryForms: boolean;
}

// encounter list types

export interface ActionProps {
  mode: string;
  label: string;
  formName: string;
  intent?: string;
}

export interface ConditionalActionProps {
  mode: string;
  label: string;
  formName: string;
  dependsOn?: string;
  dependantConcept?: string;
  dependantEncounter?: string;
  intent?: string;
}

export interface ColumnDefinition {
  id: string;
  title: string;
  isComplex?: boolean;
  concept?: string;
  secondaryConcept?: string;
  multipleConcepts?: Array<string>;
  fallbackConcepts?: Array<string>;
  actionOptions?: Array<ActionProps>;
  conditionalActionOptions?: Array<ConditionalActionProps>;
  isDate?: boolean;
  isTrueFalseConcept?: boolean;
  type?: string;
  isLink?: boolean;
  useMultipleObs?: boolean;
  valueMappings?: Record<string, string>;
  conceptMappings?: Array<string>;
  statusColorMappings?: Record<string, string>;
  isConditionalConcept?: boolean;
  conditionalConceptMappings?: Record<string, string>;
  conditionalEncounterMappings?: Record<string, ConditionalEncounterMapping>;
}

export interface ConditionalEncounterMapping {
  concept: string;
  isDate?: boolean;
}

interface LaunchOptions {
  displayText: string;
  hideFormLauncher?: boolean;
}
export interface TabSchema {
  tabName: string;
  hasFilter?: boolean;
  headerTitle: string;
  displayText: string;
  encounterType: string;
  columns: Array<ColumnDefinition>;
  formList: Array<{ name: string; uuid: string; fixedIntent?: string; excludedIntents?: Array<string> }>;
  launchOptions: LaunchOptions;
}

export type Mode = 'edit' | 'view';

export interface Action {
  label: string;
  mode: Mode;
  form?: { name: string };
  intent?: string;
}

export interface TableRow {
  id: string;
  actions: Action[] | ReactElement | null;
}
