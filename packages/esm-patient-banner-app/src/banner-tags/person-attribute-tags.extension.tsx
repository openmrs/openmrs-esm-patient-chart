import React from 'react';
import { Tag, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import usePersonAttributes from '../hooks/usePersonAttributes';
import type { ConfigObject } from '../config-schema';

interface PersonAttributeTagsProps {
  patientUuid: string;
}

const PersonAttributeTags: React.FC<PersonAttributeTagsProps> = ({ patientUuid }) => {
  const { personAttributeTagsToDisplay } = useConfig<ConfigObject>();
  const { data: attributesData } = usePersonAttributes(personAttributeTagsToDisplay?.length ? patientUuid : null);
  const { t } = useTranslation();

  if (!personAttributeTagsToDisplay.length || !Object.keys(attributesData)?.length) {
    return null;
  }

  return (
    <>
      {personAttributeTagsToDisplay.map((field) => {
        const matchingAttribute = attributesData[field];

        if (!matchingAttribute) {
          return null;
        }

        const value =
          typeof matchingAttribute.value === 'object' ? matchingAttribute.value?.display : matchingAttribute.value;

        if (!value) {
          return null;
        }

        const label = t(matchingAttribute.attributeType?.display);

        return (
          <Toggletip key={field}>
            <ToggletipButton>
              <Tag>{value}</Tag>
            </ToggletipButton>
            <ToggletipContent>{`${label}: ${value}`}</ToggletipContent>
          </Toggletip>
        );
      })}
    </>
  );
};

export default PersonAttributeTags;
