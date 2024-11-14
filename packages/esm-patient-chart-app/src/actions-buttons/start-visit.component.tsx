import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { useVisit } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import styles from './action-button.scss';

interface StartVisitOverflowMenuItemProps {
  patient: fhir.Patient;
}

const StartVisitOverflowMenuItem: React.FC<StartVisitOverflowMenuItemProps> = ({ patient }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patient?.id);
  const isDeceased = Boolean(patient?.deceasedDateTime);

  const handleLaunchModal = useCallback(() => launchPatientWorkspace('start-visit-workspace-form'), []);

  return (
    !currentVisit &&
    !isDeceased && (
      <OverflowMenuItem
        className={styles.menuitem}
        itemText={t('startVisit', 'Start visit')}
        onClick={handleLaunchModal}
      />
    )
  );
};

export default StartVisitOverflowMenuItem;
