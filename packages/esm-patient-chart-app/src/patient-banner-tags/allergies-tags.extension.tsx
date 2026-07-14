import React from 'react';
import useSWR from 'swr';
import { Tag } from '@carbon/react';
import { WarningFilled } from '@carbon/icons-react';
import { fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import styles from './visit-attribute-tags.scss';

interface AllergiesTagsProps {
  patientUuid: string;
}

interface FHIRAllergyEntry {
  resource: {
    id: string;
    clinicalStatus: {
      coding: Array<{ code: string; display: string }>;
    };
    code: {
      text?: string;
      coding: Array<{ code: string; display: string }>;
    };
    reaction?: Array<{
      severity?: string;
    }>;
  };
}

interface FHIRAllergyResponse {
  total: number;
  entry?: Array<FHIRAllergyEntry>;
}

const severityTypeMap: Record<string, 'red' | 'magenta' | 'warm-gray' | 'gray'> = {
  severe: 'red',
  moderate: 'magenta',
  mild: 'warm-gray',
};

/**
 * Displays a patient's active allergies as Carbon tags in the patient banner.
 * Slots into patient-banner-tags-slot.
 */
const AllergiesTags: React.FC<AllergiesTagsProps> = ({ patientUuid }) => {
  const url = patientUuid
    ? `${fhirBaseUrl}/AllergyIntolerance?patient=${patientUuid}&_summary=data`
    : null;

  const { data } = useSWR<{ data: FHIRAllergyResponse }>(url, openmrsFetch);

  const allergies = data?.data?.total > 0 ? data.data.entry : null;

  if (!allergies?.length) {
    return null;
  }

  return (
    <div className={`${styles.tagsContainer} ${styles.allergies}`}>
      <div className={styles.allergiesLabel}>
        <WarningFilled size={16} />
        <span>Allergies:</span>
      </div>

      {allergies.map(({ resource }) => {
        const name = resource.code?.text ?? resource.code?.coding?.[0]?.display ?? '';
        const severity = resource.reaction?.[0]?.severity;
        const tagType = severityTypeMap[severity] ?? 'gray';

        return (
          <Tag
            key={resource.id}
            type={tagType}
            title={severity ? `Severity: ${severity}` : undefined}
          >
            {name}
          </Tag>
        );
      })}
    </div>
  );
};

export default AllergiesTags;
