import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, TagSkeleton, Toggletip, ToggletipButton, ToggletipContent, Tooltip } from '@carbon/react';
import { useAllergies } from './allergy-intolerance.resource';
import styles from './allergies-list.scss';
import { severityOrder } from '../utils';

interface AllergyListProps {
  patientUuid: string;
}

const AllergyList: React.FC<AllergyListProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { allergies, isLoading } = useAllergies(patientUuid);

  const sortedAllergies = allergies?.sort((a, b) => {
    return severityOrder[a.reactionSeverity] - severityOrder[b.reactionSeverity];
  });

  if (isLoading) {
    return <TagSkeleton />;
  }
  if (sortedAllergies?.length) {
    return (
      <div className={styles.label}>
        <span>{t('allergies', 'Allergies')}:</span>
        {sortedAllergies.map((allergy) => (
          <Tooltip
            align="bottom"
            key={allergy.id}
            label={`${allergy.reactionToSubstance} - ${allergy.reactionSeverity || t('unknown', 'Unknown')}`}
          >
            <Tag className={styles.allergyLabel} data-severity={allergy.reactionSeverity?.toLowerCase()}>
              {allergy.reactionToSubstance}
            </Tag>
          </Tooltip>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.label}>
      {t('allergies', 'Allergies')}: {t('unknown', 'Unknown')}
    </div>
  );
};

export default AllergyList;
