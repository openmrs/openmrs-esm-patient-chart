import React, { useId } from 'react';
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

  const generatedId = useId();

  const labelId = `omrs-patient-chart-label-${unitName}-${generatedId}`;
  const valueId = `omrs-patient-chart-value-${unitName}-${generatedId}`;
  const unitId = `omrs-patient-chart-unit-${unitName}-${generatedId}`;

  const displayValue =
    Boolean(value) ? value : t('notAvailable', 'Not available');

  return (
    <section className={styles.container}>
      <div
        className={classNames({
          [styles['critical-value']]: flaggedCritical,
          [styles['abnormal-value']]: flaggedAbnormal,
        })}
      >
        <div className={styles['label-container']}>
          <span id={labelId} className={styles.label}>
            {unitName}
          </span>
          {flaggedAbnormal ? (
            <span className={styles[interpretation.replace('_', '-')]} title={t('abnormalValue', 'Abnormal value')} />
          ) : null}
        </div>
        <div className={styles['value-container']}>
          <div className={styles['pad-right']}>
            <span id={valueId} aria-labelledby={`${labelId} ${unitId}`} className={styles.value}>
              {displayValue}
            </span>
            <span id={unitId} className={styles.units}>
              {value ? ` ${unitSymbol}` : ''}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VitalsHeaderItem;
