import {
  getObsFromEncounter,
  getMultipleObsFromEncounter,
  resolveValueUsingMappings,
  getConceptFromMappings,
  getConditionalConceptValue,
} from './helpers';
import { renderTag } from '../../encounter-list/components/tag.component';
import {
  type Encounter,
  type ColumnDefinition,
  type TabSchema,
  type ActionProps,
  type ConditionalActionProps,
} from '../../encounter-list/types';

interface FormattedColumn {
  key: string;
  header: string;
  getValue: (encounter: any) => string;
  link?: any;
  concept?: string;
}

const getColumnValue = (encounter: Encounter, column: ColumnDefinition) => {
  if (column.id === 'actions') {
    return getActions(encounter, column);
  }

  if (column.statusColorMappings) {
    return renderTag(encounter, column.concept, column.statusColorMappings);
  }

  if (column.isConditionalConcept) {
    return getConditionalConceptValue(encounter, column.conditionalConceptMappings, column.isDate);
  }

  if (column.useMultipleObs) {
    return getMultipleObsFromEncounter(encounter, column.multipleConcepts);
  }

  if (column.valueMappings) {
    return resolveValueUsingMappings(encounter, column.concept, column.valueMappings);
  }

  if (column.conceptMappings) {
    return getMappedConceptValue(encounter, column);
  }

  return getObsFromEncounter(
    encounter,
    column.concept,
    column.isDate,
    column.isTrueFalseConcept,
    column.type,
    column.fallbackConcepts,
  );
};

const createActionObject = (encounter: Encounter, action: ActionProps | ConditionalActionProps) => ({
  form: { name: action.formName },
  encounterUuid: encounter.uuid,
  intent: action.intent || '*',
  label: action.label,
  mode: action.mode,
});

const getActions = (encounter: Encounter, column: ColumnDefinition) => {
  const baseActions = column.actionOptions?.map((action: ActionProps) => createActionObject(encounter, action)) || [];

  const conditionalActions =
    column.conditionalActionOptions?.map((action) => createConditionalAction(encounter, action)).filter(Boolean) || [];

  return [...baseActions, ...conditionalActions];
};

const createConditionalAction = (encounter: Encounter, action: ConditionalActionProps) => {
  const dependantObsValue = getObsFromEncounter(encounter, action.dependantConcept);
  if (dependantObsValue === action.dependsOn) {
    return createActionObject(encounter, action);
  }

  const dependantEncounterValue = encounter.encounterType?.uuid;
  if (dependantEncounterValue === action.dependantEncounter) {
    return createActionObject(encounter, action);
  }

  return null;
};

const getMappedConceptValue = (encounter: Encounter, column: ColumnDefinition) => {
  const concept = getConceptFromMappings(encounter, column.conceptMappings);
  return getObsFromEncounter(
    encounter,
    concept,
    column.isDate,
    column.isTrueFalseConcept,
    column.type,
    column.fallbackConcepts,
  );
};

export const getTabColumns = (columnsDefinition: Array<ColumnDefinition>) => {
  const columns: Array<FormattedColumn> = columnsDefinition.map((column: ColumnDefinition) => ({
    key: column.id,
    header: column.title,
    concept: column.concept,
    getValue: (encounter) => getColumnValue(encounter, column),
    link: column.isLink
      ? {
          getUrl: (encounter) => encounter.url,
          handleNavigate: (encounter) => encounter.launchFormActions?.viewEncounter(),
        }
      : null,
  }));

  return columns;
};

export const getMenuItemTabsConfiguration = (tabDefinitions: Array<TabSchema>) => {
  const tabs = tabDefinitions.map((tab) => {
    return {
      name: tab.tabName,
      hasFilter: tab.hasFilter || false,
      encounterType: tab.encounterType,
      headerTitle: tab.headerTitle,
      description: tab.displayText,
      formList: tab.formList,
      columns: getTabColumns(tab.columns),
      launchOptions: tab.launchOptions,
    };
  });

  return tabs;
};
