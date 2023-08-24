import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pen } from '@carbon/react/icons';
import { launchPatientWorkspace, SiderailActionButton } from '@openmrs/esm-patient-common-lib';

const VisitNoteActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => launchPatientWorkspace('visit-notes-form-workspace'), []);

  return (
    <SiderailActionButton
      getIcon={(props) => <Pen {...props} />}
      label={t('visitNote', 'Visit note')}
      iconDescription={t('note', 'Note')}
      handler={handleClick}
      workspaceMatcher={/visit-note/i}
    />
  );
};

export default VisitNoteActionButton;
