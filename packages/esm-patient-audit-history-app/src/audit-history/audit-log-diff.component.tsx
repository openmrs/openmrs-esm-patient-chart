import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import type { AuditFieldDiff } from '../types';
import { TECHNICAL_FIELDS } from '../constants';
import styles from './audit-log-diff.scss';

interface AuditLogDiffProps {
  changes: AuditFieldDiff[];
}

const AuditLogDiff: React.FC<AuditLogDiffProps> = ({ changes }) => {
  const { t } = useTranslation();

  const visibleChanges = changes.filter(
    (change) => change.changed !== false && !TECHNICAL_FIELDS.has(change.fieldName),
  );

  if (visibleChanges.length === 0) {
    return (
      <p className={styles.noChanges}>
        {t('noFieldChangesRecorded', 'No field-level changes recorded for this revision.')}
      </p>
    );
  }

  return (
    <div className={styles.diffWrapper}>
      <p className={styles.diffTitle}>{t('changeDetails', 'Change details')}</p>
      <div className={styles.diffGrid} role="table" aria-label={t('changeDetails', 'Change details')}>
        <div className={styles.headerCell} role="columnheader">
          {t('field', 'Field')}
        </div>
        <div className={styles.headerCell} role="columnheader">
          {t('previousValue', 'Previous value')}
        </div>
        <div className={styles.headerCell} role="columnheader">
          {t('newValue', 'New value')}
        </div>
        {visibleChanges.map((change, idx) => (
          <Fragment key={`${change.fieldName}-${idx}`}>
            <div className={styles.fieldCell} role="cell">
              {change.fieldName}
            </div>
            <div className={styles.valueCell} role="cell">
              <span className={styles.oldValue}>{change.oldValue !== '' ? change.oldValue : '—'}</span>
            </div>
            <div className={styles.valueCell} role="cell">
              <span className={styles.newValue}>{change.currentValue !== '' ? change.currentValue : '—'}</span>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default AuditLogDiff;
