import { Button, Loading } from '@carbon/react';
import { showModal, useFeatureFlag, useVisit } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './visit-context-header.scss';
import VisitContextInfo from './visit-context-info.component';
import { useVisitContextStore } from './visit-context';
import { useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';

interface VisitContextHeaderProps {
  patientUuid: string;
}

const VisitContextHeader: React.FC<VisitContextHeaderProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { systemVisitEnabled } = useSystemVisitSetting();
  const isRdeEnabled = useFeatureFlag('rde');
  const showVisitContextHeader = systemVisitEnabled && isRdeEnabled;

  const { currentVisit, isLoading } = useVisit(showVisitContextHeader ? patientUuid : null);
  const { manuallySetVisitUuid, setVisitContext } = useVisitContextStore();
  const isActiveVisit = !Boolean(currentVisit && currentVisit.stopDatetime);

  // This hook is needed because the `useVisit` hook sometimes
  // returns a currentVisit that isn't actually the one in the visit context.
  // TODO: move this into the useVisit hook
  useEffect(() => {
    if (showVisitContextHeader && !isLoading && currentVisit.uuid !== manuallySetVisitUuid) {
      setVisitContext(currentVisit);
    }
  }, [currentVisit, isLoading, setVisitContext, manuallySetVisitUuid, showVisitContextHeader]);

  const openVisitSwitcherModal = () => {
    const dispose = showModal('visit-context-switcher-modal', {
      patientUuid,
      closeModal: () => dispose(),
      size: 'sm',
    });
  };

  if (!showVisitContextHeader) {
    return null;
  }
  if (isLoading) {
    return (
      <div className={styles.visitContextHeader}>
        <Loading small />
      </div>
    );
  }
  return (
    <div
      className={classNames(styles.visitContextHeader, isActiveVisit ? styles.activeVisit : styles.retroactiveVisit)}
    >
      <div className={styles.addingTo}>{t('addingToVisit', 'Adding to:')}</div>
      <div className={styles.visitType}>{currentVisit.visitType.display}</div>
      <div className={styles.changeVisitButton}>
        <Button kind="ghost" size="sm" onClick={openVisitSwitcherModal}>
          {t('change', 'Change')}
        </Button>
      </div>
      <div className={styles.visitInfo}>
        <VisitContextInfo visit={currentVisit} />
      </div>
    </div>
  );
};

export default VisitContextHeader;
