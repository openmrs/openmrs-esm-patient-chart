import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pen } from '@carbon/react/icons';
import { SiderailNavButton, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';

const VisitNoteActionButton: React.FC = () => {
  const { t } = useTranslation();

  const launchVisitNotesWorkspace = useLaunchWorkspaceRequiringVisit('visit-notes-form-workspace');

  return (
    <SiderailNavButton
      name={'visit-note-nav-button'}
      getIcon={(props) => <Pen {...props} />}
      label={t('visitNote', 'Visit note')}
      iconDescription={t('note', 'Note')}
      handler={launchVisitNotesWorkspace}
      type={'visit-note'}
    />
  );
};

export default VisitNoteActionButton;
