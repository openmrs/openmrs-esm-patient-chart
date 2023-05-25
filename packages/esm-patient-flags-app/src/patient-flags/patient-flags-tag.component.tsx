import { Tag } from '@carbon/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentPath, useFlagsFromPatient } from '../hooks/usePatientFlags';
import styles from './patient-flags.scss';

interface PatientFlagsTagProps {
  patientUuid: string;
}

const PatientFlagsTag: React.FC<PatientFlagsTagProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const path = useCurrentPath();
  const [shouldShowTag, setShouldShowTag] = useState(false);
  const { flags, isLoadingFlags, flagLoadingError } = useFlagsFromPatient(patientUuid);

  console.log('showing the required flag numbers');

  useEffect(() => {
    if (path.includes('Summary')) {
      setShouldShowTag(false);
      console.log('showing the required flag numbers is set to: ', shouldShowTag);
    } else {
      setShouldShowTag(true);
      console.log('showing the required flag numbers is set to: ', shouldShowTag);
    }
  }, [path, shouldShowTag]);

  if (shouldShowTag && !isLoadingFlags && !flagLoadingError) {
    return (
      <div className={styles.flagContainer}>
        {flags && (
          <Tag type="high-contrast">
            <span className={styles.flagEmoji}>&#128681;</span>
            {flags.length > 1 ? (
              <span>
                {flags.length} {t('riskFlags', 'risk flags')}
              </span>
            ) : (
              <span>
                {flags.length} {t('riskFlag', 'risk flag')}
              </span>
            )}
          </Tag>
        )}
        {!flags && (
          <Tag type="green">
            <span className={styles.flagEmoji}>&#9989;</span> {t('noRiskFlagToDisplay', 'No risk flag to display')}
          </Tag>
        )}
      </div>
    );
  }
};

export default PatientFlagsTag;
