import React from 'react';
import { Tag } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type NotificationTag } from './notification-model';
import styles from './notification-tag.scss';

type CarbonTagType = 'red' | 'magenta' | 'purple' | 'gray';

/** Carbon tag colours, most severe first. */
const tagTypes: Record<NotificationTag, CarbonTagType> = {
  CRITICAL: 'red',
  STAT: 'magenta',
  SAMPLE_REJECTED: 'purple',
  ROUTINE: 'gray',
};

interface PriorityTagProps {
  tag: NotificationTag;
}

function usePriorityTagLabel(tag: NotificationTag): string {
  const { t } = useTranslation();

  switch (tag) {
    case 'CRITICAL':
      return t('tagCritical', 'Critical');
    case 'STAT':
      return t('tagStat', 'Stat');
    case 'SAMPLE_REJECTED':
      return t('tagSampleRejected', 'Sample rejected');
    case 'ROUTINE':
    default:
      return t('tagRoutine', 'Routine');
  }
}

const PriorityTag: React.FC<PriorityTagProps> = ({ tag }) => {
  const label = usePriorityTagLabel(tag);

  return (
    <Tag className={styles.priorityTag} size="sm" type={tagTypes[tag]}>
      {label}
    </Tag>
  );
};

export default PriorityTag;
