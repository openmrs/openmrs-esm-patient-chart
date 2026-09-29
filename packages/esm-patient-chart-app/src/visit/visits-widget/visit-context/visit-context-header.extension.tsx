import { type Visit } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './visit-context-header.scss';
import VisitContextInfo from './visit-context-info.component';
import { useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';

interface VisitContextHeaderProps {
  visitContext: Visit;
  mode: 'edit' | 'create';
}

/**
 * The visit context header displays the currently visit context
 * while editing or creating encounters
 *
 */
const VisitContextHeader: React.FC<VisitContextHeaderProps> = ({ visitContext, mode }) => {
  const { t } = useTranslation();
  const { systemVisitEnabled } = useSystemVisitSetting();

  const isActiveVisit = Boolean(visitContext && !visitContext.stopDatetime);

  const showVisitContextHeader = systemVisitEnabled && visitContext;

  if (!showVisitContextHeader) {
    return null;
  }
  return (
    <div
      className={classNames(styles.visitContextHeader, isActiveVisit ? styles.activeVisit : styles.retroactiveVisit)}
    >
      <div className={styles.addingTo}>
        {mode === 'create' ? t('addingTo', 'Adding to:') : t('editing', 'Editing:')}
      </div>
      <div className={styles.visitType}>{visitContext.visitType?.display}</div>
      <div className={styles.visitInfo}>
        <VisitContextInfo visit={visitContext} />
      </div>
    </div>
  );
};

export default VisitContextHeader;
