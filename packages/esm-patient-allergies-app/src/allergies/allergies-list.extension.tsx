import React from 'react';
import classNames from 'classnames';
import { Tag, TagSkeleton, Tooltip } from '@carbon/react';
import { getCoreTranslation, translateFrom } from '@openmrs/esm-framework';
import { useAllergies } from './allergy-intolerance.resource';
import { severityOrder } from '../utils';
import styles from './allergies-list.scss';

const moduleName = '@openmrs/esm-patient-allergies-app';

interface AllergyListProps {
  patientUuid: string;
}

const AllergyList: React.FC<AllergyListProps> = ({ patientUuid }) => {
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
        <span>{translateFrom(moduleName, 'allergies', 'Allergies')}:</span>
        {sortedAllergies.map((allergy) => (
          <Tooltip
            align="bottom"
            key={allergy.id}
            label={`${allergy.reactionToSubstance} - ${allergy.reactionSeverity ? translateFrom(moduleName, allergy.reactionSeverity) : getCoreTranslation('unknown')}`}
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
      {translateFrom(moduleName, 'allergies', 'Allergies')}: {getCoreTranslation('unknown')}
    </div>
  );
};

export default AllergyList;
