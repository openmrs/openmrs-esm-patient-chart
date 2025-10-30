import React, { useState, useCallback, useMemo } from 'react';
import { InlineLoading, Tag } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon } from '@openmrs/esm-framework';
import { useCurrentPath, usePatientFlags } from './hooks/usePatientFlags';
import Flags from './flags.component';
import styles from './flags-highlight-bar.scss';

interface FlagsHighlightBarProps {
  patientUuid: string;
}

type FlagWithPriority = ReturnType<typeof usePatientFlags>['flags'][0];

const FlagsHighlightBar: React.FC<FlagsHighlightBarProps> = ({ patientUuid }) => {
  const path = useCurrentPath();
  const { t } = useTranslation();
  const { flags, isLoading, error } = usePatientFlags(patientUuid);
  const filteredFlags = flags.filter((f: FlagWithPriority) => !f.voided);

  const riskFlags = useMemo(() => {
    return filteredFlags.filter((f: FlagWithPriority) => {
      const hasPriority = f.flagWithPriority?.priority?.name;
      return hasPriority ? hasPriority.toLowerCase() === 'risk' : false;
    });
  }, [filteredFlags]);

  const [showHighlightBar, setShowHighlightBar] = useState(false);

  const handleClick = useCallback(() => {
    setShowHighlightBar(true);
  }, []);

  const handleClose = useCallback(() => {
    setShowHighlightBar(false);
  }, []);

  const lastSegment = decodeURI(path).split('/').filter(Boolean).pop();
  if (lastSegment === 'Patient Summary') {
    return null;
  }

  if (isLoading) {
    return <InlineLoading className={styles.loader} description={`${t('loading', 'Loading')} ...`} />;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <>
      {riskFlags.length > 0 && (
        <>
          <div className={styles.flagSummary}>
            <Tag className={styles.flagsHighlightTag} type="high-contrast" onClick={handleClick}>
              <span className={styles.flagIcon}>&#128681;</span>
              <span className={styles.flagText}>
                {t('flagCount', '{{count}} risk flags', {
                  count: riskFlags.length,
                })}
              </span>
              {!showHighlightBar && <ArrowRightIcon className={styles.arrow} size={16} />}
            </Tag>
          </div>
          {showHighlightBar && (
            <div className={styles.highlightBarContainer}>
              <Flags
                onHandleCloseHighlightBar={handleClose}
                showHighlightBar={showHighlightBar}
                patientUuid={patientUuid}
              />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default FlagsHighlightBar;
