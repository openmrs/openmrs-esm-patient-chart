import React from 'react';
import classNames from 'classnames';
import { type OBSERVATION_INTERPRETATION, type ReferenceRanges } from '../types';
import { assessValue } from './helpers';
import styles from './results.scss';

export interface ResultValueProps {
  value: number | string;
  interpretation?: OBSERVATION_INTERPRETATION;
  ranges?: ReferenceRanges;
}

const interpretationToArrow: Record<OBSERVATION_INTERPRETATION, string> = {
  OFF_SCALE_HIGH: '↑↑↑',
  CRITICALLY_HIGH: '↑↑',
  HIGH: '↑',
  OFF_SCALE_LOW: '↓↓↓',
  CRITICALLY_LOW: '↓↓',
  LOW: '↓',
  NORMAL: '',
  '--': '',
};

/**
 * Displays a result value with interpretation styling.
 * Shows arrows (↑↓) and color coding based on the interpretation level.
 *
 * Can either receive an explicit interpretation or calculate it from ranges.
 * Works for both lab results and test results.
 */
export const ResultValue: React.FC<ResultValueProps> = ({ value, interpretation, ranges }) => {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
  const finalInterpretation =
    interpretation ?? (ranges && !isNaN(numericValue) ? assessValue(numericValue, ranges) : 'NORMAL');

  const arrow = interpretationToArrow[finalInterpretation];

  return (
    <span className={classNames(styles.resultValue, styles[finalInterpretation.toLowerCase()])}>
      {value}
      {arrow && ` ${arrow}`}
    </span>
  );
};
