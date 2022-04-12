import React, { useCallback } from 'react';
import Pen20 from '@carbon/icons-react/es/pen/20';
import { launchPatientWorkspace, useWorkspaces } from '@openmrs/esm-patient-common-lib';
import styles from './visit-note-action-button.scss';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import { Button } from 'carbon-components-react';

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
        <Pen20 />
        <span>{t('visitNote', 'Visit note')}</span>
      </Button>
    );
  return (
    <Button
      className={`${styles.container} ${isActive && styles.active}`}
      onClick={handleClick}
      kind="ghost"
      renderIcon={Pen20}
      hasIconOnly
      iconDescription={t('note', 'Note')}
      tooltipAlignment="start"
      tooltipPosition="left"
    />
  );
};

export default VisitNoteActionButton;
