import React, { useState, useMemo } from 'react';
import { Button, InlineLoading, Tag } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon, CloseIcon, useConfig } from '@openmrs/esm-framework';
import { useCurrentPath, usePatientFlags } from '../hooks/usePatientFlags';
import FlagsList from '../flags-list.component';
import styles from './flags-risk-count.scss';
import { type FlagsRiskCountExtensionConfig } from './extension-config-schema';

interface FlagsRiskCountExtensionProps {
  patientUuid: string;
}

const FlagsRiskCountExtension: React.FC<FlagsRiskCountExtensionProps> = ({ patientUuid }) => {
  const path = useCurrentPath();
  const { t } = useTranslation();
  const { flags, isLoading, error } = usePatientFlags(patientUuid);
  const filteredFlags = flags.filter((f) => !f.voided);
  const config = useConfig<FlagsRiskCountExtensionConfig>();

  const riskFlags = useMemo(() => {
    return filteredFlags.filter((f) => f.flagDefinition?.priority?.name?.toLowerCase() === 'risk');
  }, [filteredFlags]);

  const [showFlagsList, setShowFlagsList] = useState(false);

  const lastSegment = decodeURI(path).split('/').filter(Boolean).pop();
  if (config.hideOnPages.includes(lastSegment)) {
    return null;
  }

  if (isLoading) {
    return <InlineLoading className={styles.loader} description={`${t('loading', 'Loading')} ...`} />;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (riskFlags.length === 0) {
    return null;
  }

  return (
    <div className={styles.flagSummary}>
      <Tag
        className={styles.flagsHighlightTag}
        type={showFlagsList ? 'outline' : 'high-contrast'}
        onClick={() => setShowFlagsList(!showFlagsList)}
      >
        <span className={styles.flagIcon}>&#128681;</span>
        <span className={styles.flagText}>
          {t('flagCount', '{{count}} risk flags', {
            count: riskFlags.length,
          })}
        </span>
        {!showFlagsList && <ArrowRightIcon className={styles.arrow} size={16} />}
      </Tag>
      {showFlagsList && (
        <>
          <ArrowRightIcon className={styles.arrow} size={16} />
          <div className={styles.flagsListContainer}>
            <FlagsList patientUuid={patientUuid} />
          </div>
          <Button
            className={styles.actionButton}
            hasIconOnly
            iconDescription={t('closeFlagsBar', 'Close flags bar')}
            kind="ghost"
            renderIcon={CloseIcon}
            onClick={() => setShowFlagsList(false)}
          />
        </>
      )}
    </div>
  );
};

export default FlagsRiskCountExtension;
