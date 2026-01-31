import React from 'react';
import { useConfig } from '@openmrs/esm-framework';
import FlagsList from '../flags-list.component';
import { type FlagsListExtensionConfig } from './extension-config-schema';
import { type ConfigObject } from '../../config-schema';

interface FlagsListExtensionProps {
  patientUuid: string;
}

const FlagsListExtension: React.FC<FlagsListExtensionProps> = ({ patientUuid }) => {
  const { tags } = useConfig<FlagsListExtensionConfig & ConfigObject>();
  return <FlagsList patientUuid={patientUuid} filterByTags={tags} />;
};

export default FlagsListExtension;
