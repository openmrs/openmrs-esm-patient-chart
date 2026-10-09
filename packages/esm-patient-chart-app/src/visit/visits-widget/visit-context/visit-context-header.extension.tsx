import { type Visit } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './visit-context-header.scss';
import VisitContextInfo from './visit-context-info.component';
import { useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';

interface VisitContextHeaderProps {
  visitContext: Visit;
  /** Whether the user is adding to the visit or editing an encounter of it. Defaults to `create`. */
  mode?: 'edit' | 'create';
}

/**
 * The visit context header displays the visit that encounters are being added to or edited in.
 *
 * It is registered in the `visit-context-header-slot` slot. The visit is passed in through the slot
 * state (`{ visitContext, mode }`), not read from the patient chart store, so it can show a visit
 * other than the active visit.
 */
const VisitContextHeader: React.FC<VisitContextHeaderProps> = ({ visitContext, mode = 'create' }) => {
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
