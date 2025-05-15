import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { launchWorkspace } from '@openmrs/esm-framework';
import styles from './action-button.scss';

interface StartVisitOverflowMenuItemProps {
  patient: fhir.Patient;
}

const StartVisitOverflowMenuItem: React.FC<StartVisitOverflowMenuItemProps> = ({ patient }) => {
  const { t } = useTranslation();
  const isDeceased = Boolean(patient?.deceasedDateTime);

  const handleLaunchModal = useCallback(
    () =>
      launchWorkspace('start-visit-workspace-form', {
        openedFrom: 'patient-chart-start-visit',
      }),
    [],
  );

  return (
    !isDeceased && (
      <OverflowMenuItem className={styles.menuitem} itemText={t('addVisit', 'Add visit')} onClick={handleLaunchModal} />
    )
  );
};

export default StartVisitOverflowMenuItem;
