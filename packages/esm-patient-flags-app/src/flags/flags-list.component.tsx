import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { EditIcon, launchWorkspace2 } from '@openmrs/esm-framework';
import { type FlagWithPriority, usePatientFlags } from './hooks/usePatientFlags';
import styles from './flags-list.scss';

interface FlagsListProps {
  patientUuid: string;
}

const FlagsList: React.FC<FlagsListProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { flags, isLoading, error } = usePatientFlags(patientUuid);
  const filteredFlags = flags.filter((flag) => !flag.voided);

  const handleClickEditFlags = useCallback(() => launchWorkspace2('patient-flags-workspace'), []);

  if (!isLoading && !error) {
    return (
      <div className={styles.container}>
        <div className={styles.flagsContainer}>
          {filteredFlags.map((flag) => (
            <Flag key={flag.uuid} flag={flag} />
          ))}
        </div>
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
      </div>
    );
  }
  return null;
};

interface FlagProps {
  flag: FlagWithPriority;
}

const Flag: React.FC<FlagProps> = ({ flag }) => {
  const { t } = useTranslation();

  const priorityName = flag.flagDefinition?.priority?.name?.toLowerCase() ?? '';
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

export default FlagsList;
