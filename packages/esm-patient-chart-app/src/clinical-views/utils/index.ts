import { type TFunction } from 'i18next';
import { type Encounter, type EncounterPropertyType, getConceptFromMappings, getObsFromEncounter } from './helpers';
import { type EncounterTileColumn } from '../components/encounter-tile/encounter-tile.component';
import { OpenmrsEncounter } from '@openmrs/esm-patient-common-lib';

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
  type?: EncounterPropertyType;
  fallbackConcepts?: Array<string>;
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

const calculateDateDifferenceInDate = (givenDate: string): string => {
  const dateDifference = new Date().getTime() - new Date(givenDate).getTime();
  const totalDays = Math.floor(dateDifference / (1000 * 3600 * 24));
  return `${totalDays} days`;
};

export const getEncounterTileColumns = (tileDefinition: MenuCardProps, config: ConfigConcepts) => {
  const columns: Array<EncounterTileColumn> = tileDefinition.columns?.map((column: ColumnDefinition) => ({
    key: column.title,
    header: column.title,
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
          column.summaryConcept?.secondaryConcept,
          config,
        );
      } else {
        obsValue = getObsFromEncounter(encounter, column.concept, column.isDate, null, null, null, null, config);
      }
      return typeof obsValue === 'string' ? obsValue : obsValue?.name?.name || '--';
    },
    getSummaryObsValue: column.hasSummary
      ? (encounter) => {
          let summaryValue;

          if (column.summaryConcept?.secondaryConcept) {
            const primaryConceptType = getObsFromEncounter(
              encounter,
              column.summaryConcept.primaryConcept,
              null,
              null,
              null,
              null,
              null,
              config,
            );
            if (primaryConceptType !== '--') {
              summaryValue = primaryConceptType;
            } else {
              summaryValue = getObsFromEncounter(
                encounter,
                null,
                null,
                null,
                null,
                null,
                column.summaryConcept.secondaryConcept,
                config,
              );
            }
          } else if (column.summaryConcept?.hasCalculatedDate) {
            const primaryDate = getObsFromEncounter(
              encounter,
              column.summaryConcept.primaryConcept,
              column.summaryConcept.isDate,
              null,
              null,
              null,
              null,
              config,
            );

            if (typeof primaryDate === 'string' && primaryDate !== '--') {
              summaryValue = calculateDateDifferenceInDate(primaryDate);
            } else {
              summaryValue = '--';
            }
          } else {
            summaryValue = getObsFromEncounter(
              encounter,
              column.summaryConcept?.primaryConcept,
              column.summaryConcept?.isDate,
              null,
              null,
              null,
              null,
              config,
            );
          }
          return typeof summaryValue === 'string' ? summaryValue : summaryValue?.name?.name || '--';
        }
      : null,
  }));
  return columns;
};
