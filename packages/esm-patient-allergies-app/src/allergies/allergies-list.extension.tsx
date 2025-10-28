import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tag, TagSkeleton, Tooltip } from '@carbon/react';
import { getCoreTranslation } from '@openmrs/esm-framework';
import { useAllergies } from './allergy-intolerance.resource';
import { severityOrder } from '../utils';
import styles from './allergies-list.scss';

interface AllergyListProps {
  patientUuid: string;
}

const AllergyList: React.FC<AllergyListProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { allergies, isLoading } = useAllergies(patientUuid);

  const sortedAllergies = allergies?.sort(
    (a, b) => severityOrder[a.reactionSeverity] - severityOrder[b.reactionSeverity],
  );

  if (isLoading) {
    return (
      <div className={styles.container}>
        <TagSkeleton />
      </div>
    );
  }

  if (sortedAllergies?.length) {
    return (
      <div className={classNames(styles.label, styles.container)}>
        <span>{t('allergies', 'Allergies')}:</span>
        {sortedAllergies.map((allergy) => (
          <Tooltip
            align="bottom"
            key={allergy.id}
            label={`${allergy.reactionToSubstance} - ${allergy.reactionSeverity || getCoreTranslation('unknown')}`}
          >
            <Tag
              className={styles.allergyLabel}
              data-severity={allergy.reactionSeverity?.toLowerCase()}
              data-testid={`allergy-tag-${allergy.reactionSeverity?.toLowerCase()}`}
            >
              {allergy.reactionToSubstance}
            </Tag>
          </Tooltip>
        ))}
      </div>
    );
  }

  return (
    <div className={classNames(styles.label, styles.container)}>
      {t('allergies', 'Allergies')}: {getCoreTranslation('unknown')}
    </div>
  );
};

export default AllergyList;
