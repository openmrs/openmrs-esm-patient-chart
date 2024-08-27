import { getConceptFromMappings, getObsFromEncounter } from './encounter-list-utils';
import { extractSchemaValues, replaceWithConfigDefaults } from './shema-manipulation';

interface MenuCardProps {
  title: string;
  columns: Array<ColumnDefinition>;
}

interface SummaryConcept {
  primaryConcept: string;
  secondaryConcept?: string;
  isDate?: boolean;
  hasCalculatedDate?: boolean;
}
interface ColumnDefinition {
  id: string;
  title: string;
  concept: string;
  encounterType: string;
  isDate?: boolean;
  hasSummary?: boolean;
  conceptMappings?: Array<string>;
  summaryConcept?: SummaryConcept;
}

interface FormattedCardColumn {
  key: string;
  header: string;
  concept: string;
  encounterUuid: string;
  getObsValue: (encounter: any) => string;
  getSummaryObsValue?: (encounter: any) => string;
  hasSummary: boolean;
}

const calculateDateDifferenceInDate = (givenDate: string): string => {
  const dateDifference = new Date().getTime() - new Date(givenDate).getTime();
  const totalDays = Math.floor(dateDifference / (1000 * 3600 * 24));
  return `${totalDays} days`;
};

export const getEncounterTileColumns = (schemaConfig: MenuCardProps, config = null) => {
  const configDefaults = extractSchemaValues(config);
  const transformedSchemaConfig = replaceWithConfigDefaults(schemaConfig, configDefaults);

  const columns: Array<FormattedCardColumn> = transformedSchemaConfig.columns?.map((column) => ({
    key: column.id,
    header: column.title,
    concept: column.concept,
    encounterUuid: column.encounterType,
    hasSummary: column.hasSummary || false,
    getObsValue: (encounter) => {
      if (column.conceptMappings) {
        const concept = getConceptFromMappings(encounter, column.conceptMappings);
        return getObsFromEncounter(
          encounter,
          concept,
          column.isDate,
          column.isTrueFalseConcept,
          column.type,
          column.fallbackConcepts,
        );
      }
      return getObsFromEncounter(encounter, column.concept, column.isDate);
    },
    getSummaryObsValue: column.hasSummary
      ? (encounter) => {
          if (column.summaryConcept.secondaryConcept) {
            const primaryConceptType = getObsFromEncounter(encounter, column.summaryConcept.primaryConcept);
            if (primaryConceptType !== '--') {
              return primaryConceptType;
            } else {
              return getObsFromEncounter(encounter, column.summaryConcept.secondaryConcept);
            }
          }

          if (column.summaryConcept.hasCalculatedDate) {
            const primaryDate = getObsFromEncounter(
              encounter,
              column.summaryConcept.primaryConcept,
              column.summaryConcept.hasDate,
            );

            if (primaryDate !== '--') {
              return calculateDateDifferenceInDate(primaryDate);
            } else {
              return '--';
            }
          }

          return getObsFromEncounter(encounter, column.summaryConcept.primaryConcept, column.summaryConcept.hasDate);
        }
      : null,
  }));

  return columns;
};
