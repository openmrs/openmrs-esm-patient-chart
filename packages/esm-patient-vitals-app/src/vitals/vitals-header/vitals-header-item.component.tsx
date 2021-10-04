import React from 'react';
import styles from './vitals-header-item.component.scss';

interface VitalsHeaderItemProps {
  unitName: string;
  unitSymbol: React.ReactChild;
  value: string | number;
}

const VitalsHeaderItem: React.FC<VitalsHeaderItemProps> = ({ unitName, value, unitSymbol }) => {
  return (
    <div className={styles.vitalsHeaderStateDetailsContainer}>
      <label className={`${styles.label01} ${styles.text02}`}>{unitName}</label>
      <label>
        <span className={styles.bodyShort02}>{value || '-'} </span>
        <span className={styles.vitalsDetailsBodyShort01}>{value && unitSymbol}</span>
      </label>
    </div>
  );
};

export default VitalsHeaderItem;
