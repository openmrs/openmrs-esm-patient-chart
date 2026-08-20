import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { launchWorkspace2, showModal, useLayoutType } from '@openmrs/esm-framework';
import type { Procedure } from '../../types';
import styles from './procedures-action-menu.scss';

type ProceduresActionMenuProps = {
  procedure: Procedure;
  patientUuid: string;
};

export const ProceduresActionMenu = ({ procedure, patientUuid }: ProceduresActionMenuProps) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const launchEditProcedureForm = useCallback(
    () =>
      launchWorkspace2('procedures-form-workspace', {
        procedure,
        formContext: 'editing',
      }),
    [procedure],
  );

  const launchDeleteProcedureDialog = (procedureUuid: string) => {
    const dispose = showModal('procedure-delete-confirmation-dialog', {
      closeDeleteModal: () => dispose(),
      procedureUuid,
      patientUuid,
    });
  };

  return (
    <Layer className={styles.layer}>
      <OverflowMenu aria-label={t('options', 'Options')} align="left" size={isTablet ? 'lg' : 'sm'} flipped>
        <OverflowMenuItem
          className={styles.menuItem}
          id="editProcedure"
          onClick={launchEditProcedureForm}
          itemText={t('edit', 'Edit')}
        />
        <OverflowMenuItem
          className={styles.menuItem}
          id="deleteProcedure"
          itemText={t('delete', 'Delete')}
          onClick={() => launchDeleteProcedureDialog(procedure.uuid)}
          isDelete
          hasDivider
        />
      </OverflowMenu>
    </Layer>
  );
};
