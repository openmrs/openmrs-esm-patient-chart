import React from 'react';
import useSWR from 'swr';
import { Tag } from '@carbon/react';
import { fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import styles from './visit-attribute-tags.scss';

interface ConditionsTagsProps {
  patientUuid: string;
}

interface FHIRConditionEntry {
  resource: {
    id: string;
    clinicalStatus: {
      coding: Array<{ code: string }>;
    };
    code: {
      text?: string;
      coding: Array<{ code: string; display: string }>;
    };
  };
}

interface FHIRConditionResponse {
  total: number;
  entry?: Array<FHIRConditionEntry>;
}

const CONDITION_CATEGORY =
  'http://terminology.hl7.org/CodeSystem/condition-category|problem-list-item';

/**
 * Displays a patient's active problem-list conditions as Carbon tags in the patient banner.
 * Slots into patient-banner-tags-slot.
 */
const ConditionsTags: React.FC<ConditionsTagsProps> = ({ patientUuid }) => {
  const url = patientUuid
    ? `${fhirBaseUrl}/Condition?patient=${patientUuid}&category=${CONDITION_CATEGORY}&_count=100&_summary=data`
    : null;

  const { data } = useSWR<{ data: FHIRConditionResponse }>(url, openmrsFetch);

  const conditions = data?.data?.total > 0 ? data.data.entry : null;

  if (!conditions?.length) {
    return null;
  }

  return (
    <div className={styles.tagsContainer}>
      {conditions.map(({ resource }) => {
        const name = resource.code?.text ?? resource.code?.coding?.[0]?.display ?? '';
        const isActive = resource.clinicalStatus?.coding?.[0]?.code === 'active';

        return (
          <Tag key={resource.id} type={isActive ? 'blue' : 'cool-gray'} title={`Status: ${resource.clinicalStatus?.coding?.[0]?.code ?? 'unknown'}`}>
            {name}
          </Tag>
        );
      })}
    </div>
  );
};

export default ConditionsTags;
