import { DefinitionTooltip, Tag } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFlagsFromPatient } from '../hooks/usePatientFlags';
import styles from './patient-flags.scss';

interface PatientFlagsProps {
  patientUuid: string;
}

const PatientFlags: React.FC<PatientFlagsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { flags, isLoadingFlags, flagLoadingError } = useFlagsFromPatient(patientUuid);

  if (!isLoadingFlags && !flagLoadingError) {
    return (
      <div>
        {flags.map((patientFlag) => (
          <DefinitionTooltip
            key={patientFlag.uuid}
            className={styles.definitionToolTip}
            align="bottom-left"
            definition={
              <div role="tooltip" className={styles.tooltipPadding}>
                <span>
                  <span className={styles.tooltipSmallText}>{patientFlag.message}</span>
                </span>
              </div>
            }
          >
            <Tag key={patientFlag.name} type="high-contrast">
              <span className={styles.flagEmoji}>&#128681;</span> {patientFlag.name}
            </Tag>
          </DefinitionTooltip>
        ))}
      </div>
    );
  }
};

export default PatientFlags;
