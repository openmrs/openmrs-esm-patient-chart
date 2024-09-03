import React from 'react';
import { Tag } from '@carbon/react';
import { getObsFromEncounter, findObs } from '../../clinical-views/utils/helpers';

export const renderTag = (encounter, concept, statusColorMappings) => {
  const columnStatus = getObsFromEncounter(encounter, concept);
  const columnStatusObs = findObs(encounter, concept);

  if (columnStatus == '--') {
    return '--';
  } else {
    return (
      <Tag type={statusColorMappings[columnStatusObs?.value?.uuid]} title={columnStatus} style={{ minWidth: '80px' }}>
        {columnStatus}
      </Tag>
    );
  }
};
