import { useTranslation } from 'react-i18next';
import { showModal, useLayoutType } from '@openmrs/esm-framework';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import React, { useCallback } from 'react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import styles from './program-actions-menu.scss';

interface ProgramActionsProps {
  patientUuid: string;
  programEnrollmentId: string;
}

export const ProgramsActionsMenu = ({ patientUuid, programEnrollmentId }: ProgramActionsProps) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const launchEditProgramsForm = useCallback(
    () => launchPatientWorkspace('programs-form-workspace', { programEnrollmentId }),
    [programEnrollmentId],
  );

  const launchDeleteProgramDialog = () => {
    const dispose = showModal('program-delete-confirmation-dialog', {
      closeDeleteModal: () => dispose(),
      programEnrollmentId,
      patientUuid,
    });
  };

  return (
    <Layer className={styles.layer}>
      <OverflowMenu
        name={t('editOrDeleteProgram', 'Edit or delete program')}
        aria-label={t('editOrDeleteProgram', 'Edit or delete program')}
        size={isTablet ? 'lg' : 'sm'}
        flipped
        align="left"
      >
        <OverflowMenuItem
          className={styles.menuItem}
          id="editProgram"
          onClick={launchEditProgramsForm}
          itemText={t('edit', 'Edit')}
        />
        <OverflowMenuItem
          className={styles.menuItem}
          id="deleteProgam"
          onClick={launchDeleteProgramDialog}
          itemText={t('delete', 'Delete')}
        />
      </OverflowMenu>
    </Layer>
  );
};
