import React, { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton, PenIcon } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';

const VisitNoteActionButton: React.FC = () => {
  const { t } = useTranslation();

  const launchVisitNotesWorkspace = useLaunchWorkspaceRequiringVisit('visit-notes-form-workspace');

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
