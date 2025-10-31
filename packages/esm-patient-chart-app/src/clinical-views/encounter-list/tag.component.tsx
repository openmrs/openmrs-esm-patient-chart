import React from 'react';
import { Tag } from '@carbon/react';
import { getObsFromEncounter, findObs } from '../utils/helpers';
import { type ConfigConcepts, type Encounter } from '../types';

export const renderTag = (
  encounter: Encounter,
  concept: string,
  statusColorMappings: Record<string, string>,
  config: ConfigConcepts,
) => {
  const columnStatus = getObsFromEncounter({ encounter, obsConcept: concept, config });
  const columnStatusObs = findObs(encounter, concept);

  if (columnStatus === '--') {
    return '--';
  }

  return (
    <Tag
      type={
        typeof columnStatusObs?.value === 'object' && 'uuid' in columnStatusObs.value
          ? (statusColorMappings[columnStatusObs.value.uuid] as
              | 'red'
              | 'magenta'
              | 'purple'
              | 'blue'
              | 'cyan'
              | 'teal'
              | 'green'
              | 'gray'
              | 'cool-gray'
              | 'warm-gray'
              | 'high-contrast'
              | 'outline')
          : undefined
      }
      style={{ minWidth: '80px' }}
    >
      {typeof columnStatus === 'string' ? columnStatus : ''}
    </Tag>
  );
};
