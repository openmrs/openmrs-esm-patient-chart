import { Tag, Button, SkeletonPlaceholder } from '@carbon/react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrentPath, useFlagsFromPatient } from './hooks/usePatientFlags';
import styles from './patient-flags.scss';
import PatientFlags from './patient-flags.component';
import { ArrowRight, Close } from '@carbon/react/icons';

interface PatientFlagsTagProps {
  patientUuid: string;
}

const PatientFlagsTag: React.FC<PatientFlagsTagProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const path = useCurrentPath();
  const { flags, isLoadingFlags, flagLoadingError } = useFlagsFromPatient(patientUuid);
  const [isTooltipVisible, setTooltipVisible] = useState(false);
  const state = useMemo(() => ({ isTooltipVisible }), [isTooltipVisible]);

  const handleClick = () => {
    setTooltipVisible(true);
  };

  const handleClose = () => {
    setTooltipVisible(false);
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
      <div className={styles.flagContainer}>
        {flags && (
          <Tag type="high-contrast" onClick={handleClick}>
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
            {!isTooltipVisible && <ArrowRight size={16} />}
          </Tag>
        )}
        {!flags && (
          <Tag type="green">
            <span className={styles.flagEmoji}>&#9989;</span> {t('noRiskFlagToDisplay', 'No risk flag to display')}
          </Tag>
        )}
      </div>
      {isTooltipVisible && (
        <div
          style={{
            position: 'relative',
            padding: '0.5rem',
            borderBottom: '0.063rem solid #e0e0e0',
          }}
        >
          <PatientFlags patientUuid={patientUuid} />
          <Button
            hasIconOnly
            renderIcon={Close}
            iconDescription={t('closeSearchBar', 'Close search')}
            onClick={handleClose}
            size="sm"
            kind="ghost"
            style={{
              position: 'relative',
              top: 0,
              right: 0,
            }}
          />
        </div>
      )}
    </>
  );
};
export default PatientFlagsTag;
