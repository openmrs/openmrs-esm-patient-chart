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
  const columnStatus = getObsFromEncounter(encounter, concept, false, false, undefined, undefined, undefined, config);
  const columnStatusObs = findObs(encounter, concept);

  if (columnStatus == '--') {
    return '--';
  } else {
    return (
      <Tag
        type={
          typeof columnStatusObs?.value === 'object' && 'uuid' in columnStatusObs.value
            ? statusColorMappings[columnStatusObs.value.uuid]
            : undefined
        }
        title={columnStatus}
        style={{ minWidth: '80px' }}
      >
        {columnStatus}
      </Tag>
    );
  }
};
