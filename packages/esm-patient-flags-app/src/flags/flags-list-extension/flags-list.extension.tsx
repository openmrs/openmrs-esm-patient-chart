import React from 'react';
import FlagsList from '../flags-list.component';

interface FlagsListExtensionProps {
  patientUuid: string;
}

const FlagsListExtension: React.FC<FlagsListExtensionProps> = ({ patientUuid }) => {
  return <FlagsList patientUuid={patientUuid} />;
};

export default FlagsListExtension;
