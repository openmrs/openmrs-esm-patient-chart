import React from 'react';
import styles from './result-panel.scss';
import { OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';

export const getClass = (interpretation: OBSERVATION_INTERPRETATION) => {
  console.log('interpretation', interpretation);
  switch (interpretation) {
    case 'OFF_SCALE_HIGH':
      return styles['off-scale-high'];

    case 'CRITICALLY_HIGH':
      return styles['critically-high'];

    case 'HIGH':
      return styles['high'];

    case 'OFF_SCALE_LOW':
      return styles['off-scale-low'];

    case 'CRITICALLY_LOW':
      return styles['critically-low'];

    case 'LOW':
      return styles['low'];

    case 'NORMAL':
    default:
      return '';
  }
};
