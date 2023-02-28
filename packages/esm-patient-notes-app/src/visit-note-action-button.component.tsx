import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Pen } from '@carbon/react/icons';
import { useLayoutType } from '@openmrs/esm-framework';
import { launchPatientWorkspace, useWorkspaces } from '@openmrs/esm-patient-common-lib';
import styles from './visit-note-action-button.scss';

const VisitNoteActionButton: React.FC = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { workspaces } = useWorkspaces();

  const isActiveWorkspace = workspaces?.[0]?.name?.match(/visit-note/i);

  const handleClick = useCallback(() => launchPatientWorkspace('visit-notes-form-workspace'), []);

  if (layout === 'tablet') {
    return (
      <Button
        kind="ghost"
        className={`${styles.container} ${isActiveWorkspace ? styles.active : ''}`}
        role="button"
        tabIndex={0}
        onClick={handleClick}
      >
        <Pen size={16} />
        <span>{t('visitNote', 'Visit note')}</span>
      </Button>
    );
  }

  return (
    <Button
      className={`${styles.container} ${isActiveWorkspace && styles.active}`}
      onClick={handleClick}
      hasIconOnly
      kind="ghost"
      renderIcon={(props) => <Pen size={20} {...props} />}
      iconDescription={t('note', 'Note')}
      enterDelayMs={1000}
      tooltipAlignment="center"
      tooltipPosition="left"
      size="sm"
    />
  );
};

export default VisitNoteActionButton;
