import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { launchWorkspace2, showModal, useLayoutType } from '@openmrs/esm-framework';
import styles from './procedures-action-menu.scss';
import { type Procedure } from '../types';

interface ProceduresActionMenuProps {
  procedure: Procedure;
  patientUuid: string;
}

export const ProceduresActionMenu = ({ procedure, patientUuid }: ProceduresActionMenuProps) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const launchEditConditionsForm = useCallback(
    () =>
      launchWorkspace2('procedures-form-workspace', {
        procedure,
        formContext: 'editing',
      }),
    [procedure],
  );

  const launchDeleteConditionDialog = (procedureUuid: string) => {
    const dispose = showModal('procedure-delete-confirmation-dialog', {
      closeDeleteModal: () => dispose(),
      procedureUuid,
      patientUuid,
    });
  };

  return (
    <Layer className={styles.layer}>
      <OverflowMenu aria-label="Edit or delete condition" align="left" size={isTablet ? 'lg' : 'sm'} flipped>
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
          onClick={() => launchDeleteConditionDialog(procedure.uuid)}
          isDelete
          hasDivider
        />
      </OverflowMenu>
    </Layer>
  );
};
