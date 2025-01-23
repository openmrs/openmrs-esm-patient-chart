import {
  getObsFromEncounter,
  getMultipleObsFromEncounter,
  resolveValueUsingMappings,
  getConceptFromMappings,
  getConditionalConceptValue,
} from './helpers';
import {
  type Encounter,
  type ColumnDefinition,
  type TabSchema,
  type ActionProps,
  type ConditionalActionProps,
  type ColumnValue,
  type NamedColumn,
  type ConfigConcepts,
} from '../types';
import { renderTag } from '../encounter-list/tag.component';

export interface FormattedColumn {
  key: string;
  header: string;
  getValue: (encounter: Encounter) => ColumnValue;
  link?: { getUrl: (encounter: Encounter) => string; handleNavigate?: (encounter: Encounter) => void };
  concept?: string;
}

const getColumnValue = (encounter: Encounter, column: ColumnDefinition, config: ConfigConcepts): ColumnValue => {
  if (column.id === 'actions') {
    return getActions(encounter, column, config);
  }
  if (column.statusColorMappings) {
    return renderTag(encounter, column.concept, column.statusColorMappings, config);
  }

  if (column.isConditionalConcept) {
    return getConditionalConceptValue(encounter, column.conditionalConceptMappings, column.isDate, config);
  }

  if (column.useMultipleObs) {
    return getMultipleObsFromEncounter(encounter, column.multipleConcepts, config);
  }

  if (column.valueMappings) {
    return resolveValueUsingMappings(encounter, column.concept, column.valueMappings);
  }

  if (column.conceptMappings) {
    return getMappedConceptValue(encounter, column, config);
  }

  return getObsFromEncounter({
    encounter: encounter,
    obsConcept: column.concept,
    isDate: column.isDate,
    isTrueFalseConcept: column.isTrueFalseConcept,
    type: column.type,
    fallbackConcepts: column.fallbackConcepts,
    secondaryConcept: column.secondaryConcept,
    config: config,
  });
};

const createActionObject = (encounter: Encounter, action: ActionProps | ConditionalActionProps) => ({
  form: { name: action.formName },
  encounterUuid: encounter.uuid,
  intent: action.intent || '*',
  label: action.label,
  mode: action.mode,
});

const getActions = (encounter: Encounter, column: ColumnDefinition, config: ConfigConcepts) => {
  const baseActions = column.actionOptions?.map((action: ActionProps) => createActionObject(encounter, action)) || [];

  const conditionalActions =
    column.conditionalActionOptions
      ?.map((action) => createConditionalAction(encounter, action, config))
      .filter(Boolean) || [];

  return [...baseActions, ...conditionalActions];
};

const createConditionalAction = (encounter: Encounter, action: ConditionalActionProps, config: ConfigConcepts) => {
  const dependantObsValue = getObsFromEncounter({
    encounter: encounter,
    obsConcept: action.dependantConcept,
    config: config,
  });
  if (dependantObsValue === action.dependsOn) {
    return createActionObject(encounter, action);
  }

  const dependantEncounterValue = encounter.encounterType?.uuid;
  if (dependantEncounterValue === action.dependantEncounter) {
    return createActionObject(encounter, action);
  }

  return null;
};

const getMappedConceptValue = (encounter: Encounter, column: ColumnDefinition, config: ConfigConcepts): NamedColumn => {
  const concept = getConceptFromMappings(encounter, column.conceptMappings);
  return getObsFromEncounter({
    encounter: encounter,
    obsConcept: concept,
    isDate: column.isDate,
    isTrueFalseConcept: column.isTrueFalseConcept,
    type: column.type,
    fallbackConcepts: column.fallbackConcepts,
    secondaryConcept: column.secondaryConcept,
    config: config,
  });
};

export const getTabColumns = (columnsDefinition: Array<ColumnDefinition>, config: ConfigConcepts) => {
  const columns: Array<FormattedColumn> = columnsDefinition.map((column: ColumnDefinition) => ({
    key: column.id,
    header: column.title,
    concept: column.concept,
    getValue: (encounter) => getColumnValue(encounter, column, config),
    link: column.isLink
      ? {
          getUrl: (encounter) => encounter.url,
          handleNavigate: (encounter) => encounter.launchFormActions?.viewEncounter(),
        }
      : null,
  }));

  return columns;
};

export const getMenuItemTabsConfiguration = (tabDefinitions: Array<TabSchema>, config: ConfigConcepts) => {
  const tabs = tabDefinitions.map((tab) => {
    return {
      name: tab.tabName,
      hasFilter: tab.hasFilter || false,
      encounterType: tab.encounterType,
      headerTitle: tab.headerTitle,
      description: tab.displayText,
      formList: tab.formList,
      columns: getTabColumns(tab.columns, config),
      launchOptions: tab.launchOptions,
    };
  });

  return tabs;
};
