import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { usePatient, useVisit } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import styles from './action-button.scss';

interface StartVisitOverflowMenuItemProps {
  patientUuid: string;
}

const StartVisitOverflowMenuItem: React.FC<StartVisitOverflowMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  const { patient } = usePatient(patientUuid);
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
