import React from 'react';
import Circle16 from '@carbon/icons-react/es/circle--solid/16';
import styles from './vitals-header-item.component.scss';

interface VitalsHeaderItemProps {
  flaggedAbnormal?: boolean;
  unitName: string;
  unitSymbol: React.ReactChild;
  value: string | number;
}

const VitalsHeaderItem: React.FC<VitalsHeaderItemProps> = ({ flaggedAbnormal, value, unitName, unitSymbol }) => {
  return (
    <div className={`${styles.vitalsHeaderStateDetailsContainer} ${flaggedAbnormal ? styles.abnormalValue : ''}`}>
      <div className={styles.labelContainer}>
        <label className={`${styles.label01} ${styles.text02}`}>{unitName}</label>
        {flaggedAbnormal ? <Circle16 className={styles.dangerButton} /> : null}
      </div>
      <div className={styles.labelContainer}>
        <label>
          <span className={styles.bodyShort02}>{value || '-'} </span>
          <span className={styles.vitalsDetailsBodyShort01}>{value && unitSymbol}</span>
        </label>
      </div>
    </div>
  );
};

export default VitalsHeaderItem;
