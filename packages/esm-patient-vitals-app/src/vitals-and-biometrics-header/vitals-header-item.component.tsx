import React from 'react';
import { ObservationInterpretation } from '../common';
import styles from './vitals-header-item.scss';

interface VitalsHeaderItemProps {
  interpretation?: ObservationInterpretation;
  unitName: string;
  unitSymbol: React.ReactChild;
  value: string | number;
}

const VitalsHeaderItem: React.FC<VitalsHeaderItemProps> = ({ interpretation, value, unitName, unitSymbol }) => {
  const flaggedCritical = interpretation && interpretation.includes('critically');
  const flaggedAbnormal = interpretation && interpretation !== 'normal';

  return (
    <div className={styles.container}>
      <div className={`${flaggedCritical && styles['critical-value']} ${flaggedAbnormal && styles['abnormal-value']}`}>
        <div className={styles['label-container']}>
          <label className={styles.label}>{unitName}</label>
          {flaggedAbnormal ? (
            <div title="abnormal value">
              {interpretation === 'high' ? <span className={styles.high}></span> : null}
              {interpretation === 'critically_high' ? <span className={styles['critically-high']}></span> : null}
              {interpretation === 'low' ? <span className={styles.low}></span> : null}
              {interpretation === 'critically_low' ? <span className={styles['critically-low']}></span> : null}
            </div>
          ) : null}
        </div>
        <div className={styles['value-container']}>
          <label className={styles['pad-right']}>
            <span className={styles.value}>{value || '-'} </span>
            <span className={styles.units}>{value && unitSymbol}</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default VitalsHeaderItem;
