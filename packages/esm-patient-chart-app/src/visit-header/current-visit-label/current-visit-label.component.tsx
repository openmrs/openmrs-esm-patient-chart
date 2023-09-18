import React from 'react';
import { Tag, Button } from '@carbon/react';
import { MappedVisitQueueEntry } from '../../visit/queue-entry/queue.resource';
import { Visit } from '@openmrs/esm-framework';
import { Edit } from '@carbon/react/icons';
import styles from './current-visit-label.scss';
import NavDivider from '../nav-link.component';
import { useTranslation } from 'react-i18next';

interface CurrentVisitLabelProps {
  queueEntry: MappedVisitQueueEntry;
  currentVisit: Visit;
}

const tagStyle = {
  'Not Urgent': 'green',
  Emergency: 'red',
};

export const CurrentVisitLabel: React.FC<CurrentVisitLabelProps> = ({ queueEntry, currentVisit }) => {
  const { t } = useTranslation();
  if (!queueEntry || !currentVisit) {
    return null;
  }

  return (
    <div className={styles.container}>
      <NavDivider />
      <div className={styles.currentVisitLabelContainer}>
        <div>
          <span className={styles.visitName}>{currentVisit?.visitType?.display}</span>
          <Tag
            className={`${queueEntry?.priority === 'Priority' && styles.priorityTag} ${styles.tag}}`}
            type={tagStyle[`${queueEntry?.priority}`]}
            title={queueEntry?.priority}
          >
            {queueEntry?.priority}
          </Tag>
        </div>
        <Button
          label={t('editVisit', 'Edit visit')}
          iconDescription={t('editVisit', 'Edit visit')}
          hasIconOnly
          renderIcon={Edit}
        />
      </div>
    </div>
  );
};

export default CurrentVisitLabel;
