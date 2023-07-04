import React, { useState, useCallback } from 'react';
import { Tag, Button, SkeletonPlaceholder } from '@carbon/react';
import { ArrowRight, Close } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';

import { useCurrentPath, useFlagsFromPatient } from './hooks/usePatientFlags';
import PatientFlags from './patient-flags.component';

import styles from './patient-flags-highlight-bar.scss';

interface PatientFlagsHighlightBarProps {
  patientUuid: string;
}

const PatientFlagsHighlightBar: React.FC<PatientFlagsHighlightBarProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const path = useCurrentPath();
  const { flags, isLoadingFlags, flagLoadingError } = useFlagsFromPatient(patientUuid);
  const filteredFlags = flags.filter((f) => !f.voided);

  const [showHighlightBar, setShowHighlightBar] = useState(false);

  const handleClick = useCallback(() => {
    setShowHighlightBar(true);
  }, []);

  const handleClose = useCallback(() => {
    setShowHighlightBar(false);
  }, []);

  if (decodeURI(path).includes('Patient Summary')) {
    return null;
  }
  if (isLoadingFlags) {
    return <SkeletonPlaceholder className={styles.flagSkeleton} />;
  }
  if (flagLoadingError) {
    return <div>{flagLoadingError.message}</div>;
  }

  return (
    <>
      <div className={styles.flagSummary}>
        {filteredFlags.length > 0 && (
          <Tag type="high-contrast" onClick={handleClick} className={styles.flagsHighlightTag}>
            <span className={styles.flagIcon}>&#128681;</span>
            <span className={styles.flagText}>
              {filteredFlags.length}{' '}
              {filteredFlags.length > 1 ? t('riskFlags', 'risk flags') : t('riskFlag', 'risk flag')}
            </span>
            {!showHighlightBar && <ArrowRight size={16} />}
          </Tag>
        )}
        {filteredFlags.length === 0 && (
          <Tag type="green" onClick={handleClick} className={styles.flagsHighlightTag}>
            <span className={styles.flagIcon}>&#9989;</span>{' '}
            <span className={styles.flagText}>{t('noRiskFlagsToDisplay', 'No risk flags to display')}</span>
          </Tag>
        )}
      </div>
      {showHighlightBar && (
        <div className={styles.highlightBarContainer}>
          <PatientFlags patientUuid={patientUuid} />
          <Button
            hasIconOnly
            renderIcon={Close}
            iconDescription={t('closeFlagsBar', 'Close flags bar')}
            onClick={handleClose}
            size="sm"
            kind="ghost"
          />
        </div>
      )}
    </>
  );
};
export default PatientFlagsHighlightBar;
