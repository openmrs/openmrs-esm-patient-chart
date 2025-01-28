import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { showModal, useLayoutType } from '@openmrs/esm-framework';
import styles from './programs-action-menu.scss';

interface ProgramActionsProps {
  patientUuid: string;
  programEnrollmentId: string;
}

export const ProgramsActionMenu = ({ patientUuid, programEnrollmentId }: ProgramActionsProps) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const launchEditProgramsForm = useCallback(
    () => launchPatientWorkspace('programs-form-workspace', { programEnrollmentId }),
    [programEnrollmentId],
  );

  const launchDeleteProgramDialog = useCallback(() => {
    const dispose = showModal('program-delete-confirmation-modal', {
      closeDeleteModal: () => dispose(),
      programEnrollmentId,
      patientUuid,
      size: 'sm',
    });
  }, [programEnrollmentId, patientUuid]);

  return (
    <Layer className={styles.layer}>
      <OverflowMenu
        align="left"
        aria-label={t('editOrDeleteProgram', 'Edit or delete program')}
        flipped
        size={isTablet ? 'lg' : 'sm'}
      >
        <OverflowMenuItem
          className={styles.menuItem}
          id="editProgram"
          itemText={t('edit', 'Edit')}
          onClick={launchEditProgramsForm}
        />
        <OverflowMenuItem
          className={styles.menuItem}
          id="deleteProgam"
          hasDivider
          isDelete
          itemText={t('delete', 'Delete')}
          onClick={launchDeleteProgramDialog}
        />
      </OverflowMenu>
    </Layer>
  );
};
