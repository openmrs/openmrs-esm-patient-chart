import React from 'react';
import { Tag } from '@carbon/react';
import { formatDate, useConfig } from '@openmrs/esm-framework';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';
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
 * TODO: This component is used outside the patient chart, but incorrectly
 * relies on the patient chart store
 */
const VisitAttributeTags: React.FC<VisitAttributeTagsProps> = ({ patientUuid }) => {
  const { patientUuid: storePatientUuid, visitContext } = usePatientChartStore();
  const { visitAttributeTypes } = useConfig<ChartConfig>();

  if (patientUuid !== storePatientUuid) {
    return null;
  }
  return (
    <>
      {visitContext?.attributes
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
