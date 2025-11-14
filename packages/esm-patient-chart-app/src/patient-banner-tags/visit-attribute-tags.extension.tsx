import React from 'react';
import { Tag } from '@carbon/react';
import { formatDate, useConfig, useVisit } from '@openmrs/esm-framework';
import { type ChartConfig } from '../config-schema';
import styles from './visit-attribute-tags.scss';

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

  const displayableAttributes = activeVisit?.attributes
    ?.filter(
      (attribute) =>
        visitAttributeTypes?.find(({ uuid }) => attribute?.attributeType?.uuid === uuid)?.displayInThePatientBanner,
    )
    .map((attribute) => ({
      attribute,
      value: getAttributeValue(attribute?.attributeType, attribute?.value),
    }))
    .filter(({ value }) => value != null && value !== '');

  if (!displayableAttributes?.length) {
    return null;
  }

  return (
    <div className={styles.tagsContainer}>
      {displayableAttributes.map(({ attribute, value }) => (
        <Tag key={attribute?.attributeType?.uuid} type="gray">
          {value}
        </Tag>
      ))}
    </div>
  );
};

export default VisitAttributeTags;
