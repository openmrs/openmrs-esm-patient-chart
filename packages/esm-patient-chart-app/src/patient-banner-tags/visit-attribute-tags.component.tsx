import React from 'react';
import { Tag } from '@carbon/react';
import { formatDate } from '@openmrs/esm-framework';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';

interface VisitAttributeTagsProps {
  patientUuid: string;
}

const getAttributeValue = (attributeType, value) => {
  switch (attributeType?.datatypeClassname) {
    case 'org.openmrs.customdatatype.datatype.ConceptDatatype':
      return value;
    case 'org.openmrs.customdatatype.datatype.FloatDatatype':
      return value;
    case 'org.openmrs.customdatatype.datatype.FreeTextDatatype':
      return value;
    case 'org.openmrs.customdatatype.datatype.LongFreeTextDatatype':
      return value;
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

const VisitAttributeTags: React.FC<VisitAttributeTagsProps> = ({ patientUuid }) => {
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  return (
    <>
      {currentVisit?.attributes?.map((attribute) => (
        <Tag type="gray">{`${attribute.attributeType?.name}: ${getAttributeValue(
          attribute?.attributeType,
          attribute?.value,
        )}`}</Tag>
      ))}
    </>
  );
};

export default VisitAttributeTags;
