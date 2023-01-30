import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { Condition } from './conditions.resource';
import styles from './conditions-actions-menu.scss';

interface conditionsActionMenuProps {
  condition: Condition;
}

export const ConditionsActionMenu = ({ condition }: conditionsActionMenuProps) => {
  const { t } = useTranslation();

  const launchEditConditionsForm = useCallback(
    () =>
      launchPatientWorkspace('conditions-form-workspace', {
        workspaceTitle: 'Edit a condition',
        condition,
        context: 'editing',
      }),
    [condition],
  );
  return (
    <Layer>
      <OverflowMenu ariaLabel="condition actions" size="sm" flipped>
        <OverflowMenuItem
          className={styles.menuItem}
          id="editCondition"
          onClick={launchEditConditionsForm}
          itemText={t('edit', 'Edit')}
        />
        <OverflowMenuItem
          className={styles.menuItem}
          id="deleteCondition"
          itemText={t('delete', 'Delete')}
          isDelete={true}
          hasDivider
        />
      </OverflowMenu>
    </Layer>
  );
};
