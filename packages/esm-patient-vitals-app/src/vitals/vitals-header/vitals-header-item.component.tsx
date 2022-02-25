import React from 'react';
import Circle16 from '@carbon/icons-react/es/circle--solid/16';
import { ObservationInterpretation } from './vitals-header.component';
import styles from './vitals-header-item.scss';

interface VitalsHeaderItemProps {
  interpretation?: ObservationInterpretation;
  unitName: string;
  unitSymbol: React.ReactChild;
  value: string | number;
}

const VitalsHeaderItem: React.FC<VitalsHeaderItemProps> = ({ interpretation, value, unitName, unitSymbol }) => {
  const flaggedAbnormal = interpretation && interpretation !== ObservationInterpretation.NORMAL;

  return (
    <div className={`${styles.container} ${flaggedAbnormal ? styles['abnormal-value'] : ''}`}>
      <div className={styles['label-container']}>
        <label className={styles.label}>{unitName}</label>
        {flaggedAbnormal ? <Circle16 title="abnormal value" className={styles['danger-icon']} /> : null}
      </div>
      <div className={styles['value-container']}>
        <label className={styles['pad-right']}>
          <span className={styles.value}>{value || '-'} </span>
          <span className={styles.units}>{value && unitSymbol}</span>
        </label>
        {interpretation === ObservationInterpretation.HIGH ? <span className={styles.high}></span> : null}
        {interpretation === ObservationInterpretation.CRITICALLY_HIGH ? (
          <span className={styles['critically-high']}></span>
        ) : null}
        {interpretation === ObservationInterpretation.LOW ? <span className={styles.low}></span> : null}
        {interpretation === ObservationInterpretation.CRITICALLY_LOW ? (
          <span className={styles['critically-low']}></span>
        ) : null}
      </div>
    </div>
  );
};

export default VitalsHeaderItem;
