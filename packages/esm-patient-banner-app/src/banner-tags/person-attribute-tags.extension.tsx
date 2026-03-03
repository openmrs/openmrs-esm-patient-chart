import React from 'react';
import { Tag, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import type { ConfigObject } from '../config-schema';
import { useTranslation } from 'react-i18next';
import usePersonAttributes from '../hooks/usePatientAttributes';

interface PersonAttributeTagsProps {
  patientUuid: string;
}

const PersonAttributeTags: React.FC<PersonAttributeTagsProps> = ({ patientUuid }) => {
  const { personAttributeTagsToDisplay } = useConfig<ConfigObject>();
  const { data: attributesData } = usePersonAttributes(patientUuid);
  const { t } = useTranslation('@openmrs/esm-patient-registration-app');
  const { fieldDefinitions } = useConfig<{ fieldDefinitions: Array<{ label: string; uuid: string }> }>({
    externalModuleName: '@openmrs/esm-patient-registration-app',
  });

  if (!personAttributeTagsToDisplay.length || !Object.keys(attributesData)?.length) {
    return null;
  }

  return (
    <div>
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

        const label = t(
          fieldDefinitions?.find((f) => f?.uuid === matchingAttribute.attributeType?.uuid)?.label ??
            matchingAttribute.attributeType?.display,
        );

        return (
          <Toggletip key={field}>
            <ToggletipButton>
              <Tag>{value}</Tag>
            </ToggletipButton>
            <ToggletipContent>{`${label}: ${value}`}</ToggletipContent>
          </Toggletip>
        );
      })}
    </div>
  );
};

export default PersonAttributeTags;
