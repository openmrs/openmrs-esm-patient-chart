import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatRelativeTime } from './relative-time';

interface RelativeTimeProps {
  className?: string;
  date: string;
}

/**
 * Renders a result timestamp as a short relative label. It exists as a component, rather than the
 * inbox calling {@link formatRelativeTime} inline, so each row in the list gets its own
 * translation binding.
 */
const RelativeTime: React.FC<RelativeTimeProps> = ({ className, date }) => {
  /* Keys used by formatRelativeTime. They live in a plain .ts file, which the i18next parser does
   * not scan, so they are declared here — the same trick index.ts uses for dashboard titles.
   * t('justNow', 'Just now')
   * t('minutesAgo', '{{count}} min ago', { count: 0 })
   * t('hoursAgo', '{{count}} h ago', { count: 0 })
   * t('daysAgo', '{{count}} d ago', { count: 0 })
   */
  const { t } = useTranslation();
  return <span className={className}>{formatRelativeTime(date, t)}</span>;
};

export default RelativeTime;
