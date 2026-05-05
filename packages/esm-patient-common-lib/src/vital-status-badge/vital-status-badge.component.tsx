import React, { memo } from 'react';
import { Tag } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import type { VitalSeverity } from '../utils/clinical-utils';
import styles from './vital-status-badge.scss';

export interface VitalStatusBadgeProps {
  /** Clinical severity level */
  severity: VitalSeverity;
  /** Optional human-readable label override */
  label?: string;
  /** Whether to show the label text alongside the color dot */
  showLabel?: boolean;
}

/**
 * A compact, color-coded badge indicating vital sign status.
 *
 * Color conventions (also distinguishable by shape for accessibility):
 * - normal → green tag
 * - low    → magenta tag (below normal)
 * - high   → yellow tag (above normal)
 * - critical → red tag
 *
 * Memoized to avoid re-renders in large vital sign tables.
 */
export const VitalStatusBadge: React.FC<VitalStatusBadgeProps> = memo(({ severity, label, showLabel = true }) => {
  const { t } = useTranslation('@openmrs/esm-patient-chart-app');

  const tagTypeMap: Record<VitalSeverity, 'green' | 'magenta' | 'warm-gray' | 'red'> = {
    normal: 'green',
    low: 'magenta',
    high: 'warm-gray',
    critical: 'red',
  };

  const defaultLabelMap: Record<VitalSeverity, string> = {
    normal: t('normal', 'Normal'),
    low: t('low', 'Low'),
    high: t('high', 'High'),
    critical: t('critical', 'Critical'),
  };

  const displayLabel = label ?? defaultLabelMap[severity];

  return (
    <Tag
      className={styles.badge}
      type={tagTypeMap[severity]}
      title={`${t('vitalStatus', 'Vital status')}: ${displayLabel}`}
      size="sm"
    >
      {showLabel ? displayLabel : null}
    </Tag>
  );
});

VitalStatusBadge.displayName = 'VitalStatusBadge';
