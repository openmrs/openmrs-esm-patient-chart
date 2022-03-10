import React from 'react';
import Pen20 from '@carbon/icons-react/es/pen/20';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import styles from './visit-note-action-menu.scss';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';

const VisitNoteActionMenu: React.FC = () => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  return (
    <>
      {isTablet && (
        <div
          className={styles.visitNoteNavContainer}
          role="button"
          tabIndex={0}
          onClick={() => launchPatientWorkspace('visit-notes-form-workspace')}
        >
          <Pen20 />
          <span>{t('visitNote', 'Visit note')}</span>
        </div>
      )}
    </>
  );
};

export default VisitNoteActionMenu;
