import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { CloseIcon, EditIcon, launchWorkspace } from '@openmrs/esm-framework';
import { usePatientFlags } from './hooks/usePatientFlags';
import styles from './flags.scss';

interface FlagsProps {
  patientUuid: string;
  onHandleCloseHighlightBar: () => void;
  showHighlightBar: boolean;
}

type FlagWithPriority = ReturnType<typeof usePatientFlags>['flags'][0];

const Flags: React.FC<FlagsProps> = ({ patientUuid, onHandleCloseHighlightBar, showHighlightBar }) => {
  const { t } = useTranslation();
  const { flags, isLoading, error } = usePatientFlags(patientUuid);
  const filteredFlags = flags.filter((flag: FlagWithPriority) => !flag.voided);

  const handleClickEditFlags = useCallback(() => launchWorkspace('patient-flags-workspace'), []);

  const renderFlag = (flag: FlagWithPriority) => {
    const hasPriority = flag.flagWithPriority?.priority?.name;
    const priorityName = hasPriority ? hasPriority.toLowerCase() : '';

    const isInfoFlag = priorityName === 'info';
    const isRiskFlag = priorityName === 'risk';

    return (
      <Toggletip key={flag.uuid} align="bottom-start">
        <ToggletipButton label={isRiskFlag ? t('riskFlag', 'Risk flag') : t('infoFlag', 'Info flag')}>
          <Tag
            className={isInfoFlag ? styles.infoFlagTag : isRiskFlag ? styles.flagTag : undefined}
            type={isRiskFlag ? 'high-contrast' : undefined}
          >
            {isRiskFlag && <span className={styles.flagIcon}>&#128681;</span>}
            {flag.flag.display}
          </Tag>
        </ToggletipButton>
        <ToggletipContent>
          <div className={styles.content}>
            <p className={styles.title}>{flag.flag.display}</p>
            <p className={styles.message}>{flag.message}</p>
          </div>
        </ToggletipContent>
      </Toggletip>
    );
  };

  if (!isLoading && !error) {
    return (
      <div className={styles.container}>
        <div className={styles.flagsContainer}>{filteredFlags.map(renderFlag)}</div>
        {filteredFlags.length > 0 ? (
          <Button
            className={styles.actionButton}
            kind="ghost"
            renderIcon={EditIcon}
            onClick={handleClickEditFlags}
            iconDescription={t('editFlags', 'Edit flags')}
          >
            {t('edit', 'Edit')}
          </Button>
        ) : null}
        {showHighlightBar ? (
          <Button
            className={styles.actionButton}
            hasIconOnly
            iconDescription={t('closeFlagsBar', 'Close flags bar')}
            kind="ghost"
            renderIcon={CloseIcon}
            onClick={onHandleCloseHighlightBar}
          />
        ) : null}
      </div>
    );
  }
  return null;
};

export default Flags;
