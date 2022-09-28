import React from 'react';
import { CircleSolid } from '@carbon/react/icons';
import { ObservationInterpretation } from '../vitals.resource';
import styles from './vitals-header-item.scss';

interface VitalsHeaderItemProps {
  interpretation?: ObservationInterpretation;
  unitName: string;
  unitSymbol: React.ReactChild;
  value: string | number;
}

const VitalsHeaderItem: React.FC<VitalsHeaderItemProps> = ({ interpretation, value, unitName, unitSymbol }) => {
  const flaggedAbnormal = interpretation && interpretation !== 'normal';

  return (
    <div className={`${styles.container} ${flaggedAbnormal ? styles['abnormal-value'] : ''}`}>
      <div className={styles['label-container']}>
        <label className={styles.label}>{unitName}</label>
        {flaggedAbnormal ? <CircleSolid size={16} title="abnormal value" className={styles['danger-icon']} /> : null}
      </div>
      <div className={styles['value-container']}>
        <label className={styles['pad-right']}>
          <span className={styles.value}>{value || '-'} </span>
          <span className={styles.units}>{value && unitSymbol}</span>
        </label>
        {interpretation === 'high' ? <span className={styles.high}></span> : null}
        {interpretation === 'critically_high' ? <span className={styles['critically-high']}></span> : null}
        {interpretation === 'low' ? <span className={styles.low}></span> : null}
        {interpretation === 'critically_low' ? <span className={styles['critically-low']}></span> : null}
      </div>
    </div>
  );
};

export default VitalsHeaderItem;
