import { type TFunction } from 'i18next';
import { getConceptFromMappings, getObsFromEncounter } from './helpers';

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

export interface ColumnDefinition {
  id: string;
  title: string;
  concept: string;
  encounterType: string;
  isDate?: boolean;
  hasSummary?: boolean;
  conceptMappings?: Array<string>;
  summaryConcept?: SummaryConcept;
  isTrueFalseConcept?: boolean;
  type?: string;
  fallbackConcepts?: Array<string>;
}

export interface FormattedCardColumn {
  key: string;
  header: string;
  concept: string;
  encounterUuid: string;
  title?: string;
  getObsValue: (encounter: any) => string;
  getSummaryObsValue?: (encounter: any) => string;
  hasSummary: boolean;
}

const calculateDateDifferenceInDate = (givenDate: string): string => {
  const dateDifference = new Date().getTime() - new Date(givenDate).getTime();
  const totalDays = Math.floor(dateDifference / (1000 * 3600 * 24));
  return `${totalDays} days`;
};

export const getEncounterTileColumns = (tileDefinition: MenuCardProps, t?: TFunction) => {
  const columns: Array<FormattedCardColumn> = tileDefinition.columns?.map((column: ColumnDefinition) => ({
    key: column.title,
    header: t(column.title),
    concept: column.concept,
    encounterUuid: column.encounterType,
    hasSummary: column.hasSummary || false,
    getObsValue: (encounter) => {
      let obsValue;
      if (column.conceptMappings) {
        const concept = getConceptFromMappings(encounter, column.conceptMappings);
        obsValue = getObsFromEncounter(
          encounter,
          concept,
          column.isDate,
          column.isTrueFalseConcept,
          column.type,
          column.fallbackConcepts,
        );
      } else {
        obsValue = getObsFromEncounter(encounter, column.concept, column.isDate);
      }
      return typeof obsValue === 'string' ? obsValue : obsValue?.name?.name || '--';
    },
    getSummaryObsValue: column.hasSummary
      ? (encounter) => {
          let summaryValue;

          if (column.summaryConcept.secondaryConcept) {
            const primaryConceptType = getObsFromEncounter(encounter, column.summaryConcept.primaryConcept);
            if (primaryConceptType !== '--') {
              summaryValue = primaryConceptType;
            } else {
              summaryValue = getObsFromEncounter(encounter, column.summaryConcept.secondaryConcept);
            }
          } else if (column.summaryConcept.hasCalculatedDate) {
            const primaryDate = getObsFromEncounter(
              encounter,
              column.summaryConcept.primaryConcept,
              column.summaryConcept.isDate,
            );

            if (typeof primaryDate === 'string' && primaryDate !== '--') {
              summaryValue = calculateDateDifferenceInDate(primaryDate);
            } else {
              summaryValue = '--';
            }
          } else {
            summaryValue = getObsFromEncounter(
              encounter,
              column.summaryConcept.primaryConcept,
              column.summaryConcept.isDate,
            );
          }
          return typeof summaryValue === 'string' ? summaryValue : summaryValue?.name?.name || '--';
        }
      : null,
  }));
  return columns;
};
