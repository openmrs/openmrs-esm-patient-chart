import React from 'react';
import { NumericObservation } from '@openmrs/esm-framework';
import type { ObservationInterpretation } from '../common';

interface VitalsHeaderItemProps {
  conceptUuid?: string;
  interpretation?: ObservationInterpretation;
  patientUuid: string;
  unitName: string;
  unitSymbol: string;
  value: string | number;
}

const VitalsHeaderItem: React.FC<VitalsHeaderItemProps> = ({
  conceptUuid,
  interpretation,
  patientUuid,
  value,
  unitName,
  unitSymbol,
}) => {
  return (
    <NumericObservation
      value={value}
      unit={unitSymbol}
      label={unitName}
      interpretation={interpretation}
      conceptUuid={conceptUuid}
      variant="card"
      patientUuid={patientUuid}
    />
  );
};

export default VitalsHeaderItem;
