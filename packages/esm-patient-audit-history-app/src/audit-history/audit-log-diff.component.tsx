import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import type { AuditFieldDiff } from '../types';
import { getVisibleChanges, isFullSnapshot } from '../constants';
import { formatDisplayValue, humanizeFieldName } from './audit-log-format';
import styles from './audit-log-diff.scss';

interface AuditLogDiffProps {
  changes: AuditFieldDiff[];
  eventType?: string;
}

const AuditLogDiff: React.FC<AuditLogDiffProps> = ({ changes, eventType }) => {
  const { t } = useTranslation();

  const visibleChanges = getVisibleChanges(changes);

  if (visibleChanges.length === 0) {
    return (
      <p className={styles.noChanges}>
        {t('noFieldChangesRecorded', 'No field-level changes recorded for this revision.')}
      </p>
    );
  }

  // A genuine ADD, or the first audited edit of a pre-Envers patient, has no prior state to
  // compare against (every old value is empty), so a field-by-field diff is just a full dump.
  // Show a compact summary with the initial values available on demand instead.
  if (isFullSnapshot(visibleChanges)) {
    const isAdd = String(eventType ?? '').toUpperCase() === 'ADD';
    return (
      <div className={styles.diffWrapper}>
        <p className={styles.diffTitle}>
          {isAdd
            ? t('recordCreated', 'Record created')
            : t('baselineRecorded', 'Baseline recorded — no prior revision to compare')}
        </p>
        <p className={styles.noChanges}>
          {t('fieldsSetCount', '{{count}} fields set', { count: visibleChanges.length })}
        </p>
        <details className={styles.snapshotDetails}>
          <summary>{t('showInitialValues', 'Show initial values')}</summary>
          <div className={styles.snapshotGrid}>
            {visibleChanges.map((change, idx) => (
              <Fragment key={`${change.fieldName}-${idx}`}>
                <div className={styles.fieldCell}>{humanizeFieldName(change.fieldName)}</div>
                <div className={styles.valueCell}>
                  <span className={styles.newValue}>
                    {formatDisplayValue(change.currentValue, change.currentDisplay, change.fieldName) || '—'}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </details>
      </div>
    );
  }

  return (
    <div className={styles.diffWrapper}>
      <p className={styles.diffTitle}>{t('changeDetails', 'Change details')}</p>
      <div className={styles.diffGrid} role="table" aria-label={t('changeDetails', 'Change details')}>
        <div className={styles.row} role="row">
          <div className={styles.headerCell} role="columnheader">
            {t('field', 'Field')}
          </div>
          <div className={styles.headerCell} role="columnheader">
            {t('previousValue', 'Previous value')}
          </div>
          <div className={styles.headerCell} role="columnheader">
            {t('newValue', 'New value')}
          </div>
        </div>
        {visibleChanges.map((change, idx) => (
          <div className={styles.row} role="row" key={`${change.fieldName}-${idx}`}>
            <div className={styles.fieldCell} role="cell">
              {humanizeFieldName(change.fieldName)}
            </div>
            <div className={styles.valueCell} role="cell">
              <span className={styles.oldValue}>
                {formatDisplayValue(change.oldValue, change.oldDisplay, change.fieldName) || '—'}
              </span>
            </div>
            <div className={styles.valueCell} role="cell">
              <span className={styles.newValue}>
                {formatDisplayValue(change.currentValue, change.currentDisplay, change.fieldName) || '—'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditLogDiff;
