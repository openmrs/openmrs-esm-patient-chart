import { Button, Loading } from '@carbon/react';
import { showModal, useFeatureFlag, useVisit } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './visit-context-header.scss';
import VisitContextInfo from './visit-context-info.component';
import { usePatientChartStore, useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';

interface VisitContextHeaderProps {
  patientUuid: string;
}

/**
 * The visit context header displays the currently select visit context in the patient chart store.
 * When creating encounters (ex: visit notes, order entry, vitals), they are associated
 * with the visit in context.
 *
 * This extension uses the patient chart store and should only be shown within the patient chart.
 * It does not render when mounted outside the patient chart.
 */
const VisitContextHeader: React.FC<VisitContextHeaderProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { systemVisitEnabled } = useSystemVisitSetting();
  const isRdeEnabled = useFeatureFlag('rde');

  const { patientUuid: storePatientUuid, visitContext } = usePatientChartStore();
  const isActiveVisit = Boolean(visitContext && !visitContext.stopDatetime);

  const showVisitContextHeader = systemVisitEnabled && isRdeEnabled && storePatientUuid === patientUuid;

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
  return (
    <div
      className={classNames(styles.visitContextHeader, isActiveVisit ? styles.activeVisit : styles.retroactiveVisit)}
    >
      <div className={styles.addingTo}>{t('addingToVisit', 'Adding to:')}</div>
      <div className={styles.visitType}>{visitContext.visitType.display}</div>
      <div className={styles.changeVisitButton}>
        <Button kind="ghost" size="sm" onClick={openVisitSwitcherModal}>
          {t('change', 'Change')}
        </Button>
      </div>
      <div className={styles.visitInfo}>
        <VisitContextInfo visit={visitContext} />
      </div>
    </div>
  );
};

export default VisitContextHeader;
