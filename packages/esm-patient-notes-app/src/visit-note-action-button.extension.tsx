import React, { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton, PenIcon } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';

/**
 * This button uses the patient chart store and MUST only be used
 * within the patient chart
 */
const VisitNoteActionButton: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { t } = useTranslation();

  const launchVisitNotesWorkspace = useLaunchWorkspaceRequiringVisit(patientUuid, 'visit-notes-form-workspace');

  return (
    <ActionMenuButton
      getIcon={(props: ComponentProps<typeof PenIcon>) => <PenIcon {...props} />}
      label={t('visitNote', 'Visit note')}
      iconDescription={t('note', 'Note')}
      handler={launchVisitNotesWorkspace}
      type={'visit-note'}
    />
  );
};

export default VisitNoteActionButton;
