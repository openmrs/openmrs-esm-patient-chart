import React from 'react';
import { NumericObservation } from '@openmrs/esm-framework';
import type { ObservationInterpretation } from '../common';

interface VitalsHeaderItemProps {
  interpretation?: ObservationInterpretation;
  unitName: string;
  unitSymbol: React.ReactNode;
  value: string | number;
}

const VitalsHeaderItem: React.FC<VitalsHeaderItemProps> = ({ interpretation, value, unitName, unitSymbol }) => {
  return (
    <NumericObservation
      value={value}
      unit={unitSymbol}
      label={unitName}
      interpretation={interpretation}
      variant="card"
      showLabel={true}
    />
  );
};

export default VitalsHeaderItem;
