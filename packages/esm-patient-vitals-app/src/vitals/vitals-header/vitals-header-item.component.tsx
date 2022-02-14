import React from 'react';
import Circle16 from '@carbon/icons-react/es/circle--solid/16';
import styles from './vitals-header-item.component.scss';
import { ObservationInterpretation } from './vitals-header.component';

interface VitalsHeaderItemProps {
  flaggedAbnormal?: boolean;
  interpretation?: ObservationInterpretation;
  unitName: string;
  unitSymbol: React.ReactChild;
  value: string | number;
}

const VitalsHeaderItem: React.FC<VitalsHeaderItemProps> = ({
  flaggedAbnormal,
  interpretation,
  value,
  unitName,
  unitSymbol,
}) => {
  return (
    <div className={`${styles.vitalsHeaderStateDetailsContainer} ${flaggedAbnormal ? styles.abnormalValue : ''}`}>
      <div className={styles.labelContainer}>
        <label className={`${styles.label01} ${styles.text02}`}>{unitName}</label>
        {flaggedAbnormal ? <Circle16 className={styles.dangerButton} /> : null}
      </div>
      <div className={styles.labelContainer}>
        <label className={styles.padRight}>
          <span className={styles.bodyShort02}>{value || '-'} </span>
          <span className={styles.vitalsDetailsBodyShort01}>{value && unitSymbol}</span>
        </label>
        {interpretation === ObservationInterpretation.LOW ? <span className={styles.low}></span> : null}
        {interpretation === ObservationInterpretation.CRITICALLY_LOW ? (
          <span className={styles.critically_low}></span>
        ) : null}
        {interpretation === ObservationInterpretation.HIGH ? <span className={styles.high}></span> : null}
        {interpretation === ObservationInterpretation.CRITICALLY_HIGH ? (
          <span className={styles.critically_high}></span>
        ) : null}
      </div>
    </div>
  );
};

export default VitalsHeaderItem;
