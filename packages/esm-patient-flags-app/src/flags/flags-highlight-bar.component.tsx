import React, { useState, useCallback } from 'react';
import { InlineLoading, Tag } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useCurrentPath, usePatientFlags } from './hooks/usePatientFlags';
import Flags from './flags.component';
import styles from './flags-highlight-bar.scss';

interface FlagsHighlightBarProps {
  patientUuid: string;
}

const FlagsHighlightBar: React.FC<FlagsHighlightBarProps> = ({ patientUuid }) => {
  const path = useCurrentPath();
  const { t } = useTranslation();
  const { flags, isLoading, error } = usePatientFlags(patientUuid);
  const filteredFlags = flags.filter((f) => !f.voided);
  const riskFlags = filteredFlags.filter((f) => f.tags.some((t) => t.display.includes('risk')));

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

  if (isLoading) {
    <InlineLoading className={styles.loader} description={`${t('loading', 'Loading')} ...`} />;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <>
      {riskFlags.length > 0 && (
        <>
          <div className={styles.flagSummary}>
            <Tag type="high-contrast" onClick={handleClick} className={styles.flagsHighlightTag}>
              <span className={styles.flagIcon}>&#128681;</span>
              <span className={styles.flagText}>
                {t('flagCount', '{{count}} risk flags', {
                  count: riskFlags.length,
                })}
              </span>
              {!showHighlightBar && <ArrowRight className={styles.arrow} size={16} />}
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
