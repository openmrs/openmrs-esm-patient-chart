import { useTranslation } from 'react-i18next';
import { showModal, useLayoutType } from '@openmrs/esm-framework';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import React, { useCallback } from 'react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

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
    const dispose = showModal('program-delete-confirmation-modal', {
      closeDeleteModal: () => dispose(),
      programEnrollmentId,
      patientUuid,
    });
  };

  return (
    <Layer>
      <OverflowMenu
        name={t('editOrDeleteProgram', 'Edit or delete program')}
        aria-label={t('editOrDeleteProgram', 'Edit or delete program')}
        size={isTablet ? 'lg' : 'sm'}
        flipped
      >
        <OverflowMenuItem id="editProgram" onClick={launchEditProgramsForm} itemText={t('edit', 'Edit')} />
        <OverflowMenuItem id="deleteProgam" onClick={launchDeleteProgramDialog} itemText={t('delete', 'Delete')} />
      </OverflowMenu>
    </Layer>
  );
};
