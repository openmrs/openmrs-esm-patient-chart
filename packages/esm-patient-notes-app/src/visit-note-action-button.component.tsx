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
  const isActive = workspaces.find(({ name }) => name.includes('visit-note'));
  const handleClick = useCallback(() => launchPatientWorkspace('visit-notes-form-workspace'), []);

  if (layout === 'tablet')
    return (
      <Button
        kind="ghost"
        className={`${styles.container} ${isActive ? styles.active : ''}`}
        role="button"
        tabIndex={0}
        onClick={handleClick}
      >
        <Pen size={20} />
        <span>{t('visitNote', 'Visit note')}</span>
      </Button>
    );
  return (
    <Button
      className={`${styles.container} ${isActive && styles.active}`}
      onClick={handleClick}
      hasIconOnly
      kind="ghost"
      renderIcon={(props) => <Pen size={20} {...props} />}
      iconDescription={t('note', 'Note')}
      tooltipAlignment="start"
      tooltipPosition="left"
    />
  );
};

export default VisitNoteActionButton;
