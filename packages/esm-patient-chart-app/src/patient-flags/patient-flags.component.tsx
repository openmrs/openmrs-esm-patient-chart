import React, { useCallback } from 'react';
import { Toggletip, ToggletipButton, ToggletipContent, Tag, Button } from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

import { useFlagsFromPatient } from './hooks/usePatientFlags';

import styles from './patient-flags.scss';

interface PatientFlagsProps {
  patientUuid: string;
}

const PatientFlags: React.FC<PatientFlagsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { flags, isLoadingFlags, flagLoadingError } = useFlagsFromPatient(patientUuid);
  const filteredFlags = flags.filter((f) => !f.voided);

  const handleEditFlagsClick = useCallback(() => launchPatientWorkspace('edit-flags-side-panel-form'), []);

  if (!isLoadingFlags && !flagLoadingError) {
    return (
      <div className={styles.flagsContainer}>
        <div>
          {filteredFlags.map((patientFlag) => (
            <Toggletip key={patientFlag.uuid} className={styles.toggleTip} align="bottom" direction="right">
              <ToggletipButton label="Additional information">
                <Tag key={patientFlag.uuid} type="high-contrast" className={styles.flagTag}>
                  <span className={styles.flagIcon}>&#128681;</span> {patientFlag.flag.display}
                </Tag>
              </ToggletipButton>
              <ToggletipContent className={styles.tooltipContent}>
                <span className={styles.tooltipSmallText}>{patientFlag.message}</span>
              </ToggletipContent>
            </Toggletip>
          ))}
        </div>
        <Button
          kind="ghost"
          renderIcon={Edit}
          iconDescription={t('editFlags', 'Edit Flags')}
          onClick={handleEditFlagsClick}
        >
          {t('edit', 'Edit')}
        </Button>
      </div>
    );
  }
};

export default PatientFlags;
