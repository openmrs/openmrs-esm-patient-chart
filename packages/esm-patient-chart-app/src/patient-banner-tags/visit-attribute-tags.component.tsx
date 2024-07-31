import React from 'react';
import { Tag } from '@carbon/react';
import { formatDate, useConfig } from '@openmrs/esm-framework';
import { type ChartConfig } from '../config-schema';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
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

const VisitAttributeTags: React.FC<VisitAttributeTagsProps> = ({ patientUuid }) => {
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);
  const { visitAttributeTypes } = useConfig() as ChartConfig;

  return (
    <div className={styles.visitAttributeTags}>
      {currentVisit?.attributes
        ?.filter(
          (attribute) =>
            visitAttributeTypes.find(({ uuid }) => attribute?.attributeType?.uuid === uuid)?.displayInThePatientBanner,
        )
        .map((attribute) => <Tag type="gray">{getAttributeValue(attribute?.attributeType, attribute?.value)}</Tag>)}
    </div>
  );
};

export default VisitAttributeTags;
