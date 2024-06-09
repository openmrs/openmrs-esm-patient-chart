import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pen } from '@carbon/react/icons';
import { useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import { ActionMenuButton } from '@openmrs/esm-framework';

const VisitNoteActionButton: React.FC = () => {
  const { t } = useTranslation();

  const launchVisitNotesWorkspace = useLaunchWorkspaceRequiringVisit('visit-notes-form-workspace');

  return (
    <ActionMenuButton
      getIcon={(props) => <Pen {...props} />}
      label={t('visitNote', 'Visit note')}
      iconDescription={t('note', 'Note')}
      handler={launchVisitNotesWorkspace}
      type={'visit-note'}
    />
  );
};

export default VisitNoteActionButton;
