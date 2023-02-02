import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { showModal } from '@openmrs/esm-framework';
import { Condition } from './conditions.resource';
import styles from './conditions-action-menu.scss';

interface conditionsActionMenuProps {
  condition: Condition;
}

export const ConditionsActionMenu = ({ condition }: conditionsActionMenuProps) => {
  const { t } = useTranslation();

  const launchEditConditionsForm = useCallback(
    () =>
      launchPatientWorkspace('conditions-form-workspace', {
        workspaceTitle: t('editCondition', 'Edit a Condition'),
        condition,
        context: 'editing',
      }),
    [condition, t],
  );

  const launchDeleteConditionDialog = (conditionId: string) => {
    const dispose = showModal('condition-delete-confirmation-dialog', {
      closeDeleteModal: () => dispose(),
      conditionId,
    });
  };

  return (
    <Layer className={styles.layer}>
      <OverflowMenu ariaLabel="Edit or delete condition" size="sm" flipped>
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
          onClick={() => launchDeleteConditionDialog(condition.id)}
          isDelete={true}
          hasDivider
        />
      </OverflowMenu>
    </Layer>
  );
};
