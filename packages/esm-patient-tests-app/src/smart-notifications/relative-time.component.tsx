import React from 'react';
import { formatDatetime, parseDate } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

const minute = 60_000;
const hour = 60 * minute;
const day = 24 * hour;

/**
 * Short relative label for a result timestamp — "Just now", "12 min ago", "3 h ago", "2 d ago" —
 * falling back to an absolute datetime beyond a week, where "N d ago" stops being useful.
 */
export function useRelativeTimeLabel(date: string | undefined): string {
  const { t } = useTranslation();

  if (!date) {
    return '';
  }

  const parsed = parseDate(date);
  const elapsed = Date.now() - parsed.getTime();

  if (elapsed < minute) {
    return t('justNow', 'Just now');
  }
  if (elapsed < hour) {
    return t('minutesAgo', '{{count}} min ago', { count: Math.floor(elapsed / minute) });
  }
  if (elapsed < day) {
    return t('hoursAgo', '{{count}} h ago', { count: Math.floor(elapsed / hour) });
  }
  if (elapsed < 7 * day) {
    return t('daysAgo', '{{count}} d ago', { count: Math.floor(elapsed / day) });
  }
  return formatDatetime(parsed, { mode: 'wide' });
}

interface RelativeTimeProps {
  className?: string;
  date: string;
}

const RelativeTime: React.FC<RelativeTimeProps> = ({ className, date }) => {
  const label = useRelativeTimeLabel(date);
  return <span className={className}>{label}</span>;
};

export default RelativeTime;
