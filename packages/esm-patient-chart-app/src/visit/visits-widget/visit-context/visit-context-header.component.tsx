import React from 'react';
import classNames from 'classnames';
import { Button, Loading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showModal, useFeatureFlag } from '@openmrs/esm-framework';
import { usePatientChartStore, useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';
import VisitContextInfo from './visit-context-info.component';
import styles from './visit-context-header.scss';

interface VisitContextHeaderProps {
  patientUuid: string;
}

const VisitContextHeader: React.FC<VisitContextHeaderProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { currentVisit, isLoading } = usePatientChartStore().visits;
  const { systemVisitEnabled } = useSystemVisitSetting();

  const isRdeEnabled = useFeatureFlag('rde');
  const showVisitContextHeader = systemVisitEnabled && isRdeEnabled;
  const isActiveVisit = !Boolean(currentVisit && currentVisit.stopDatetime);

  const openVisitSwitcherModal = () => {
    const dispose = showModal('visit-context-switcher', {
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
