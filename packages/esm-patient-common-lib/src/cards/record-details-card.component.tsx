import React from 'react';
import styles from './record-details-card.css';
import { useTranslation } from 'react-i18next';
import { SummaryCard } from './summary-card.component';

export interface RecordDetailsProps {
  styles?: React.CSSProperties;
}

export const RecordDetails: React.FC<RecordDetailsProps> = (props) => {
  const { t } = useTranslation();

  return (
    <SummaryCard
      name={t('details', 'Details')}
      styles={{
        width: '100%',
        backgroundColor: 'var(--omrs-color-bg-medium-contrast)',
      }}>
      <div style={props.styles} className={`omrs-type-body-regular ${styles.detailsCard}`}>
        {props.children}
      </div>
    </SummaryCard>
  );
};
