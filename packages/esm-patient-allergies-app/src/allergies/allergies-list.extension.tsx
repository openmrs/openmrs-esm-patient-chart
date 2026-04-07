import React, { useCallback } from 'react';
import classNames from 'classnames';
import { Button, Tag, TagSkeleton, Tooltip } from '@carbon/react';
import { AddIcon, getCoreTranslation, launchWorkspace2, translateFrom } from '@openmrs/esm-framework';
import { useAllergies } from './allergy-intolerance.resource';
import { patientAllergiesFormWorkspace } from '../constants';
import { severityOrder } from '../utils';
import styles from './allergies-list.scss';

const moduleName = '@openmrs/esm-patient-allergies-app';

interface AllergyListProps {
  patientUuid: string;
}

const AllergyList: React.FC<AllergyListProps> = ({ patientUuid }) => {
  const { allergies, isLoading } = useAllergies(patientUuid);
  const launchAllergiesForm = useCallback(
    () => launchWorkspace2(patientAllergiesFormWorkspace, { formContext: 'creating' }),
    [],
  );

  const sortedAllergies = allergies
    ? [...allergies].sort((a, b) => severityOrder[a.reactionSeverity] - severityOrder[b.reactionSeverity])
    : undefined;

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
        <Button
          hasIconOnly
          kind="ghost"
          iconDescription={translateFrom(moduleName, 'recordNewAllergy', 'Record a new allergy')}
          onClick={launchAllergiesForm}
          renderIcon={(props) => <AddIcon size={16} {...props} />}
          size="sm"
        />
      </div>
    );
  }

  return (
    <div className={classNames(styles.label, styles.container)}>
      {translateFrom(moduleName, 'allergies', 'Allergies')}: {getCoreTranslation('unknown')}
      <Button
        hasIconOnly
        kind="ghost"
        iconDescription={translateFrom(moduleName, 'recordNewAllergy', 'Record a new allergy')}
        onClick={launchAllergiesForm}
        renderIcon={(props) => <AddIcon size={16} {...props} />}
        size="sm"
      />
    </div>
  );
};

export default AllergyList;
