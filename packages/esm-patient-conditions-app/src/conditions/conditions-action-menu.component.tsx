import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { showModal, useLayoutType } from '@openmrs/esm-framework';
import { Condition } from './conditions.resource';
import styles from './conditions-action-menu.scss';

interface conditionsActionMenuProps {
  condition: Condition;
  patientUuid?: string;
}

export const ConditionsActionMenu = ({ condition, patientUuid }: conditionsActionMenuProps) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const launchEditConditionsForm = useCallback(
    () =>
      launchPatientWorkspace('conditions-form-workspace', {
        workspaceTitle: t('editCondition', 'Edit a Condition'),
        condition,
        formContext: 'editing',
      }),
    [condition, t],
  );

  const launchDeleteConditionDialog = (conditionId: string) => {
    const dispose = showModal('condition-delete-confirmation-dialog', {
      closeDeleteModal: () => dispose(),
      conditionId,
      patientUuid,
    });
  };

  return (
    <Layer className={styles.layer}>
      <OverflowMenu aria-label="Edit or delete condition" size={isTablet ? 'lg' : 'sm'} flipped>
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
          isDelete
          hasDivider
        />
      </OverflowMenu>
    </Layer>
  );
};
