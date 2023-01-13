import React from 'react';
import styles from './medication-order-form.scss';
import { Layer } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';

export function InputWrapper({ children }) {
  const isTablet = useLayoutType() === 'tablet';
  return (
    <Layer level={isTablet ? 1 : 0}>
      <div className={styles.field}>{children}</div>
    </Layer>
  );
}
