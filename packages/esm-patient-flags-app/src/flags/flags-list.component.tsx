import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { type ConfigObject, EditIcon, launchWorkspace2, useConfig } from '@openmrs/esm-framework';
import { type FlagWithPriority, usePatientFlags } from './hooks/usePatientFlags';
import styles from './flags-list.scss';

interface FlagsListProps {
  patientUuid: string;
}

const FlagsList: React.FC<FlagsListProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { flags, isLoading, error } = usePatientFlags(patientUuid);
  const filteredFlags = flags.filter((flag) => !flag.voided);
  const config = useConfig<ConfigObject>();

  const handleClickEditFlags = useCallback(() => launchWorkspace2('patient-flags-workspace'), []);

  if (!isLoading && !error) {
    return (
      <div className={styles.container}>
        <ul className={styles.flagsList}>
          {filteredFlags.map((flag) => (
            <li key={flag.uuid}>
              <Flag flag={flag} />
            </li>
          ))}
        </ul>
        {config.allowFlagDeletion ? (
          <Button
            className={styles.actionButton}
            hasIconOnly
            kind="ghost"
            size="sm"
            renderIcon={EditIcon}
            onClick={handleClickEditFlags}
            iconDescription={t('editFlags', 'Edit flags')}
          />
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
  const priorityName = flag.flagDefinition?.priority?.name?.toLowerCase() ?? '';
  const isInfoFlag = priorityName === 'info';
  const isRiskFlag = priorityName === 'risk';

  return (
    <Tag
      key={flag.uuid}
      className={isInfoFlag ? styles.infoFlagTag : isRiskFlag ? styles.flagTag : undefined}
      type={isRiskFlag ? 'high-contrast' : undefined}
    >
      {isRiskFlag && <span className={styles.flagIcon}>&#128681;</span>}
      {flag.message}
    </Tag>
  );
};

export default FlagsList;
