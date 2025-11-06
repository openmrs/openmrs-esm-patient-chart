import React from 'react';
import { Tag } from '@carbon/react';
import { formatDate, useConfig, useVisit } from '@openmrs/esm-framework';
import { type ChartConfig } from '../config-schema';

interface VisitAttributeTagsProps {
  patientUuid: string;
}

const getAttributeValue = (attributeType, value) => {
  switch (attributeType?.datatypeClassname) {
    case 'org.openmrs.customdatatype.datatype.ConceptDatatype':
      return value?.display;
    case 'org.openmrs.customdatatype.datatype.FloatDatatype':
    case 'org.openmrs.customdatatype.datatype.FreeTextDatatype':
    case 'org.openmrs.customdatatype.datatype.LongFreeTextDatatype':
    case 'org.openmrs.customdatatype.datatype.BooleanDatatype':
      return value;
    case 'org.openmrs.customdatatype.datatype.DateDatatype':
      return formatDate(new Date(value), {
        mode: 'wide',
      });
    default:
      return value;
  }
};

/**
 * This extension slots to the patient-banner-tags-slot by default.
 */
const VisitAttributeTags: React.FC<VisitAttributeTagsProps> = ({ patientUuid }) => {
  const { activeVisit } = useVisit(patientUuid);
  const { visitAttributeTypes } = useConfig<ChartConfig>();

  if (activeVisit == null) {
    return null;
  }
  return (
    <>
      {activeVisit?.attributes
        ?.filter(
          (attribute) =>
            visitAttributeTypes.find(({ uuid }) => attribute?.attributeType?.uuid === uuid)?.displayInThePatientBanner,
        )
        .map((attribute) => (
          <Tag key={attribute?.attributeType?.uuid} type="gray">
            {getAttributeValue(attribute?.attributeType, attribute?.value)}
          </Tag>
        ))}
    </>
  );
};

export default VisitAttributeTags;
