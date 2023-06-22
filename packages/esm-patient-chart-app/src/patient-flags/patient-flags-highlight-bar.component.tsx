import React, { useState } from 'react';
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
  const [showHighlightBar, setShowHighlightBar] = useState(false);

  const handleClick = () => {
    setShowHighlightBar(true);
  };

  const handleClose = () => {
    setShowHighlightBar(false);
  };

  if (path.includes('Summary')) {
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
        {flags.length && (
          <Tag type="high-contrast" onClick={handleClick} className={styles.flagsHighlightTag}>
            <span className={styles.flagIcon}>&#128681;</span>
            <span className={styles.flagText}>
              {flags.length} {flags.length > 1 ? t('riskFlags', 'risk flags') : t('riskFlag', 'risk flag')}
            </span>
            {!showHighlightBar && <ArrowRight size={16} />}
          </Tag>
        )}
        {!flags && (
          <Tag type="green">
            <span className={styles.flagIcon}>&#9989;</span> {t('noRiskFlagToDisplay', 'No risk flag to display')}
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
