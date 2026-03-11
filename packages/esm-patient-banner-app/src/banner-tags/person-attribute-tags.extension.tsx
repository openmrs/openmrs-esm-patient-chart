import React from 'react';
import { Tag, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import usePersonAttributes from '../hooks/usePersonAttributes';
import type { ConfigObject } from '../config-schema';

interface PersonAttributeTagsProps {
  patientUuid: string;
}

export interface PersonAttributeTagConfig {
  attributeType: string;
}

const PersonAttributeTags: React.FC<PersonAttributeTagsProps> = ({ patientUuid }) => {
  const { attributeType } = useConfig<PersonAttributeTagConfig>();
  const { data: attributesData } = usePersonAttributes(attributeType ? patientUuid : null);
  const { t } = useTranslation();

  if (!attributeType || !attributesData[attributeType]) {
    return null;
  }

  const attribute = attributesData[attributeType];

  return (
    <Toggletip key={attribute.uuid}>
      <ToggletipButton>
        <Tag>{typeof attribute.value === 'object' ? attribute.value.display : attribute.value}</Tag>
      </ToggletipButton>
      <ToggletipContent>{`${attribute.attributeType.display}: ${typeof attribute.value === 'object' ? attribute.value.display : attribute.value}`}</ToggletipContent>
    </Toggletip>
  );
};

export default PersonAttributeTags;
