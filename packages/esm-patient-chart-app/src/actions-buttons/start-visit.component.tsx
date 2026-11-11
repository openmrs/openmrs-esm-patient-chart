import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { launchStartVisitWorkspace } from '../visit/visit-form/launch-start-visit-workspace';
import styles from './action-button.scss';

interface StartVisitOverflowMenuItemProps {
  patient: fhir.Patient;
  closeMenu?: () => void;
}

const StartVisitOverflowMenuItem: React.FC<StartVisitOverflowMenuItemProps> = ({ patient, closeMenu }) => {
  const { t } = useTranslation();
  const isDeceased = Boolean(patient?.deceasedDateTime);

  const handleLaunchModal = useCallback(() => {
    launchStartVisitWorkspace({ openedFrom: 'patient-chart-start-visit' }, patient.id, patient);
  }, [patient]);

  return (
    !isDeceased && (
      <OverflowMenuItem
        className={styles.menuitem}
        itemText={t('addVisit', 'Add visit')}
        onClick={handleLaunchModal}
        closeMenu={closeMenu}
      />
    )
  );
};

export default StartVisitOverflowMenuItem;
