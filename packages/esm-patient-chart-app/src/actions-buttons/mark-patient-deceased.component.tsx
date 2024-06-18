import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { usePatientDeceased } from '../deceased/deceased.resource';
import styles from './action-button.scss';

const MarkPatientDeceasedOverflowMenuItem = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { isDead, isLoading: isPatientLoading } = usePatientDeceased(patientUuid);

  const handleLaunchModal = useCallback(() => launchPatientWorkspace('mark-patient-deceased-workspace-form'), []);

  return (
    !isPatientLoading &&
    !isDead && (
      <OverflowMenuItem
        className={styles.menuitem}
        itemText={t('markDeceased', 'Mark deceased')}
        onClick={handleLaunchModal}
      />
    )
  );
};

export default MarkPatientDeceasedOverflowMenuItem;
