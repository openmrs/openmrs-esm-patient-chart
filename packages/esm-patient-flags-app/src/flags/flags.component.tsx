import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag, Toggletip, ToggletipButton, ToggletipContent } from '@carbon/react';
import { CloseIcon, EditIcon } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { usePatientFlags } from './hooks/usePatientFlags';
import styles from './flags.scss';

interface FlagsProps {
  patientUuid: string;
  onHandleCloseHighlightBar: () => void;
  showHighlightBar: boolean;
}

const Flags: React.FC<FlagsProps> = ({ patientUuid, onHandleCloseHighlightBar, showHighlightBar }) => {
  const { t } = useTranslation();
  const { flags, isLoading, error } = usePatientFlags(patientUuid);
  const filteredFlags = flags.filter((f) => !f.voided);

  const handleClickEditFlags = useCallback(() => launchPatientWorkspace('edit-flags-side-panel-form'), []);

  const InfoFlags = () => {
    const hasInfoFlag = (tags) => tags?.filter((t) => t.display.includes('info')).length;
    const infoFlags = filteredFlags.filter((f) => hasInfoFlag(f.tags));

    return (
      <>
        {infoFlags?.map((infoFlag) => (
          <Toggletip key={infoFlag.uuid} align="bottom-left">
            <ToggletipButton label="Info flag">
              <Tag key={infoFlag.uuid} className={styles.infoFlagTag}>
                {infoFlag.flag.display}
              </Tag>
            </ToggletipButton>
            <ToggletipContent>
              <div className={styles.content}>
                <p className={styles.title}>{infoFlag.flag.display}</p>
                <p className={styles.message}>{infoFlag.message}</p>
              </div>
            </ToggletipContent>
          </Toggletip>
        ))}
      </>
    );
  };

  const RiskFlags = () => {
    const hasRiskFlag = (tags) => tags?.filter((t) => t.display.includes('risk')).length;
    const riskFlags = filteredFlags.filter((f) => hasRiskFlag(f.tags));

    return (
      <>
        {riskFlags.map((riskFlag) => (
          <Toggletip key={riskFlag.uuid} align="bottom-left">
            <ToggletipButton label="Risk flag">
              <Tag key={riskFlag.uuid} type="high-contrast" className={styles.flagTag}>
                <span className={styles.flagIcon}>&#128681;</span> {riskFlag.flag.display}
              </Tag>
            </ToggletipButton>
            <ToggletipContent>
              <div className={styles.content}>
                <p className={styles.title}>{riskFlag.flag.display}</p>
                <p className={styles.message}>{riskFlag.message}</p>
              </div>
            </ToggletipContent>
          </Toggletip>
        ))}
      </>
    );
  };

  if (!isLoading && !error) {
    return (
      <div className={styles.container}>
        <div className={styles.flagsContainer}>
          <RiskFlags />
          <InfoFlags />
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
};

export default Flags;
