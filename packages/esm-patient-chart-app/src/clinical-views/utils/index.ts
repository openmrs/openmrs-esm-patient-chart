import { getConceptFromMappings, getObsFromEncounter } from './helpers';
import type { Encounter, ColumnDefinition, ConfigConcepts, EncounterTileColumn, MenuCardProps } from '../types';
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
        obsValue = getObsFromEncounter({
          encounter: encounter,
          obsConcept: concept,
          isDate: column.isDate,
          isTrueFalseConcept: column.isTrueFalseConcept,
          type: column.type,
          fallbackConcepts: column.fallbackConcepts,
          secondaryConcept: column.summaryConcept?.secondaryConcept,
          config: config,
        });
      } else {
        obsValue = getObsFromEncounter({
          encounter: encounter,
          obsConcept: column.concept,
          isDate: column.isDate,
          config: config,
        });
      }
      return typeof obsValue === 'string' ? obsValue : obsValue?.name?.name ?? '--';
    },
    getSummaryObsValue: column.hasSummary
      ? (encounter: Encounter) => {
          let summaryValue;

          if (column.summaryConcept?.secondaryConcept) {
            const primaryConceptType = getObsFromEncounter({
              encounter: encounter,
              obsConcept: column.summaryConcept.primaryConcept,
              config: config,
            });

            if (primaryConceptType !== '--') {
              summaryValue = primaryConceptType;
            } else {
              summaryValue = getObsFromEncounter({
                encounter: encounter,
                obsConcept: column.summaryConcept.secondaryConcept,
                config: config,
              });
            }
          } else if (column.summaryConcept?.hasCalculatedDate) {
            const primaryDate = getObsFromEncounter({
              encounter: encounter,
              obsConcept: column.summaryConcept.primaryConcept,
              isDate: column.summaryConcept.isDate,
              config,
            });

            if (typeof primaryDate === 'string' && primaryDate !== '--') {
              summaryValue = calculateDateDifferenceInDate(primaryDate);
            } else {
              summaryValue = '--';
            }
          } else {
            summaryValue = getObsFromEncounter({
              encounter: encounter,
              obsConcept: column.summaryConcept?.primaryConcept,
              isDate: column.summaryConcept?.isDate,
              config: config,
            });
          }
          return typeof summaryValue === 'string' ? summaryValue : summaryValue?.name?.name || '--';
        }
      : null,
  }));
  return columns;
};
