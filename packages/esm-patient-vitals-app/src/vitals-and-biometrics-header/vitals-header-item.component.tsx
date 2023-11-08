import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import type { ObservationInterpretation } from '../common';
import styles from './vitals-header-item.scss';

interface VitalsHeaderItemProps {
  interpretation?: ObservationInterpretation;
  unitName: string;
  unitSymbol: React.ReactNode;
  value: string | number;
}

const VitalsHeaderItem: React.FC<VitalsHeaderItemProps> = ({ interpretation, value, unitName, unitSymbol }) => {
  const { t } = useTranslation();
  const flaggedCritical = interpretation && interpretation.includes('critically');
  const flaggedAbnormal = interpretation && interpretation !== 'normal';

  return (
    <section className={styles.container}>
      <div
        className={classNames({
          [styles['critical-value']]: flaggedCritical,
          [styles['abnormal-value']]: flaggedAbnormal,
        })}
      >
        <div className={styles['label-container']}>
          <label className={styles.label}>{unitName}</label>
          {flaggedAbnormal ? (
            <span className={styles[interpretation.replace('_', '-')]} title={t('abnormalValue', 'Abnormal value')} />
          ) : null}
        </div>
        <div className={styles['value-container']}>
          <label className={styles['pad-right']}>
            <span className={styles.value}>{value || '-'} </span>
            <span className={styles.units}>{value && unitSymbol}</span>
          </label>
        </div>
      </div>
    </section>
  );
};

export default VitalsHeaderItem;
