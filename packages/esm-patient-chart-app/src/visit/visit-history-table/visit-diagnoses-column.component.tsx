import { Tag } from '@carbon/react';
import { type Visit } from '@openmrs/esm-framework';
import React from 'react';
import { type DiagnosesColumnConfig } from '../../visit-table-config-schema';
import { type Encounter } from '../visits-widget/visit.resource';

interface Props {
  visit: Visit;
}

export const getVisitDiagnosisCell = (config: DiagnosesColumnConfig) => {
  const VisitDiagnosisCell: React.FC<Props> = ({ visit }) => {
    const diagnoses = visit.encounters
      .flatMap((encounter: Encounter) => encounter.diagnoses)
      .sort((a, b) => a.rank - b.rank);

    // TODO: make tag colors configurable
    return (
      <>
        {diagnoses.map((diagnosis) => (
          <Tag key={`${diagnosis.uuid}`} type={diagnosis.rank === 1 ? 'red' : 'blue'}>
            {diagnosis.display}
          </Tag>
        ))}
      </>
    );
  };
  return VisitDiagnosisCell;
};
