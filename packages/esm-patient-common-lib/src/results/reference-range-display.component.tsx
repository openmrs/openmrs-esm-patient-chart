import React from 'react';
import { useTranslation } from 'react-i18next';
import { type ReferenceRanges } from '../types';
import { formatReferenceRange } from './helpers';
import styles from './results.scss';

interface ReferenceRangeDisplayProps {
  ranges: ReferenceRanges | null;
  units?: string;
}

/**
 * Displays a formatted reference range with units.
 * Shows "N/A" when no valid range is available.
 */
export const ReferenceRangeDisplay: React.FC<ReferenceRangeDisplayProps> = ({ ranges, units }) => {
  const { t } = useTranslation();
  const formatted = formatReferenceRange(ranges, units);

  if (formatted === '--') {
    return <span className={styles.noRange}>{t('notApplicable', 'N/A')}</span>;
  }

  return <span className={styles.referenceRange}>{formatted}</span>;
};
