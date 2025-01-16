import { getConceptFromMappings, getObsFromEncounter } from './helpers';
import {
  type Encounter,
  type ColumnDefinition,
  type ConfigConcepts,
  type EncounterTileColumn,
  type MenuCardProps,
} from '../types';
import dayjs from 'dayjs';

const calculateDateDifferenceInDate = (givenDate: string): string => {
  return `${dayjs().diff(dayjs(givenDate), 'days')} days`;
};

export const getEncounterTileColumns = (tileDefinition: MenuCardProps, config: ConfigConcepts) => {
  const columns: Array<EncounterTileColumn> = tileDefinition.columns?.map((column: ColumnDefinition) => ({
    key: column.title,
    header: column.title,
    concept: column.concept,
    encounterTypeUuid: column.encounterType,
    hasSummary: column.hasSummary || false,
    getObsValue: (encounter: Encounter) => {
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
      return typeof obsValue === 'string' ? obsValue : obsValue?.name?.name ?? '--';
    },
    getSummaryObsValue: column.hasSummary
      ? (encounter: Encounter) => {
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
