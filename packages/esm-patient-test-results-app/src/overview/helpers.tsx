import React from 'react';
import styles from './lab-results.scss';
import { TableRow } from 'carbon-components-react';
import { OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import Information16 from '@carbon/icons-react/es/information/16';
import dayjs from 'dayjs';

export function formatDate(date: Date) {
  return dayjs(date).format('DD/MM/YYYY · HH:mm');
}

export const headers = [
  { key: 'name', header: 'Test Name' },
  { key: 'value', header: 'Value' },
  { key: 'range', header: 'Reference Range' },
];

export const Main = ({ className = '', ...props }) => <main {...props} className={`omrs-main-content ${className}`} />;

export const RecentResultsGrid = (props) => {
  return <div {...props} className={styles['recent-results-grid']} />;
};
export const Card = ({ ...props }) => <div {...props} className={styles.card} />;

export const Separator = ({ ...props }) => <div {...props} className={styles.separator} />;

export const InfoButton = () => <Information16 className={styles['info-button']} />;

export const TypedTableRow: React.FC<{
  interpretation: OBSERVATION_INTERPRETATION;
}> = ({ interpretation, ...props }) => {
  switch (interpretation) {
    case 'OFF_SCALE_HIGH':
      return <TableRow {...props} className={styles['off-scale-high']} />;

    case 'CRITICALLY_HIGH':
      return <TableRow {...props} className={styles['critically-high']} />;

    case 'HIGH':
      return <TableRow {...props} className={styles['high']} />;

    case 'OFF_SCALE_LOW':
      return <TableRow {...props} className={styles['off-scale-low']} />;

    case 'CRITICALLY_LOW':
      return <TableRow {...props} className={styles['critically-low']} />;

    case 'LOW':
      return <TableRow {...props} className={styles['low']} />;

    case 'NORMAL':
    default:
      return <TableRow {...props} />;
  }
};
