import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { usePatientDeceasedStatus } from '../data.resource';
import styles from './action-button.scss';

const MarkPatientDeceasedOverflowMenuItem = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { isDead, isLoading: isPatientLoading } = usePatientDeceasedStatus(patientUuid);

  const handleLaunchModal = useCallback(() => launchPatientWorkspace('mark-patient-deceased-workspace-form'), []);

  return (
    !isPatientLoading &&
    !isDead && (
      <OverflowMenuItem
        className={styles.menuitem}
        itemText={t('markPatientDeceased', 'Mark patient deceased')}
        onClick={handleLaunchModal}
      />
    )
  );
};

export default MarkPatientDeceasedOverflowMenuItem;
