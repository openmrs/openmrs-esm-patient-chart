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

  const hasRiskFlag = (tags) => tags?.filter((t) => t.display.includes('risk')).length;
  const hasInfoFlag = (tags) => tags?.filter((t) => t.display.includes('info')).length;

  const riskFlags = filteredFlags.filter((f) => hasRiskFlag(f.tags));
  const infoFlags = filteredFlags.filter((f) => hasInfoFlag(f.tags));

  const handleEditFlagsClick = useCallback(() => launchPatientWorkspace('edit-flags-side-panel-form'), []);

  if (!isLoadingFlags && !flagLoadingError) {
    return (
      <div className={styles.flagsContainer}>
        <div>
          {riskFlags?.map((patientFlag) => (
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
          {infoFlags?.map((patientFlag) => (
            <Toggletip key={patientFlag.uuid} className={styles.toggleTip} align="bottom" direction="right">
              <ToggletipButton label="Additional information">
                <Tag key={patientFlag.uuid} type="orange" className={styles.infoFlagTag}>
                  {patientFlag.flag.display}
                </Tag>
              </ToggletipButton>
              <ToggletipContent className={styles.tooltipContent}>
                <span className={styles.tooltipSmallText}>{patientFlag.message}</span>
              </ToggletipContent>
            </Toggletip>
          ))}
        </div>
        {filteredFlags.length === 0 && (
          <Tag type="green" className={styles.flagsHighlightTag}>
            <span className={styles.flagIcon}>&#9989;</span>{' '}
            <span className={styles.flagText}>{t('noRiskFlagToDisplay', 'No risk flag to display')}</span>
          </Tag>
        )}
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
