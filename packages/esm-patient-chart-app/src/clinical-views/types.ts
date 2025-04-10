import { type ReactElement } from 'react';
import { type OpenmrsResource } from '@openmrs/esm-framework';

export type TableHeaderType = {
  key: string;
  header: string;
};

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
          display?: string;
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
  type?: EncounterPropertyType;
  isLink?: boolean;
  useMultipleObs?: boolean;
  valueMappings?: Record<string, string>;
  conceptMappings?: Array<string>;
  statusColorMappings?: Record<string, string>;
  isConditionalConcept?: boolean;
  conditionalConceptMappings?: Record<string, string>;
  conditionalEncounterMappings?: Record<string, ConditionalEncounterMapping>;
  encounterType: string;
  hasSummary?: boolean;
  summaryConcept?: SummaryConcept;
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

export interface FormColumn {
  form: { name: string };
  encounterUuid: string;
  intent: string;
  label: string;
  mode: string;
}

export type NamedColumn =
  | string
  | {
      uuid: string;
      name: { name: string };
      names?: { uuid: string; name: string; conceptNameType: string }[];
    };

export type ColumnValue = string | number | JSX.Element | NamedColumn | Array<NamedColumn> | Array<FormColumn> | null;

export interface ConfigConcepts {
  trueConceptUuid: string;
  falseConceptUuid: string;
  otherConceptUuid: string;
}

export interface FormattedColumn {
  key: string;
  header: string;
  getValue: (encounter: Encounter) => ColumnValue;
  link?: { getUrl: (encounter: Encounter) => string; handleNavigate?: (encounter: Encounter) => void };
  concept?: string;
}

export interface EncounterTileColumn {
  key: string;
  header: string;
  encounterTypeUuid: string;
  concept: string;
  title?: string;
  getObsValue: (encounter: Encounter) => string;
  getSummaryObsValue?: (encounter: Encounter) => string;
  encounter?: Encounter;
  hasSummary?: Boolean;
}
export interface EncounterTileProps {
  patientUuid: string;
  columns: Array<EncounterTileColumn>;
  headerTitle: string;
}

export interface MenuCardProps {
  tileHeader: string;
  columns: Array<ColumnDefinition>;
}

interface SummaryConcept {
  primaryConcept: string;
  secondaryConcept?: string;
  isDate?: boolean;
  hasCalculatedDate?: boolean;
}

export interface FormattedCardColumn {
  key: string;
  header: string;
  concept: string;
  encounterUuid: string;
  title?: string;
  getObsValue: (encounter: Encounter) => string;
  getSummaryObsValue?: (encounter: Encounter) => string;
  hasSummary: boolean;
}

export interface ConfigConcepts {
  trueConceptUuid: string;
  falseConceptUuid: string;
  otherConceptUuid: string;
}

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

export enum EncounterPropertyType {
  location = 'location',
  provider = 'provider',
  visitType = 'visitType',
  ageAtEncounter = 'ageAtEncounter',
}

export interface GetObsFromEncounterParams {
  encounter: Encounter;
  obsConcept: string;
  isDate?: boolean;
  isTrueFalseConcept?: boolean;
  type?: EncounterPropertyType;
  fallbackConcepts?: Array<string>;
  secondaryConcept?: string;
  config?: ConfigConcepts;
}
