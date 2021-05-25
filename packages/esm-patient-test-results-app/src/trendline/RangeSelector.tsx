import Tabs from 'carbon-components-react/es/components/Tabs';
import Tab from 'carbon-components-react/es/components/Tab';
import * as React from 'react';

import styles from './trendline.scss';

export enum RangeTypes {
  DAY_1,
  DAY_5,
  MONTH_1,
  MONTH_6,
  YEAR_1,
  YEAR_5,
  ALL,
}

export const deduceRange = (type: RangeTypes, upperRange: Date, lowerRange: Date): [Date, Date] | [] => {
  switch (type) {
    case RangeTypes.DAY_1:
      return [new Date(Date.parse(upperRange.toString()) - 1 * 24 * 3600 * 1000), upperRange];
    case RangeTypes.DAY_5:
      return [new Date(Date.parse(upperRange.toString()) - 5 * 24 * 3600 * 1000), upperRange];
    case RangeTypes.MONTH_1:
      return [new Date(Date.parse(upperRange.toString()) - 30 * 24 * 3600 * 1000), upperRange];
    case RangeTypes.MONTH_6:
      return [new Date(Date.parse(upperRange.toString()) - 182 * 24 * 3600 * 1000), upperRange];
    case RangeTypes.YEAR_1:
      return [new Date(Date.parse(upperRange.toString()) - 365 * 24 * 3600 * 1000), upperRange];
    case RangeTypes.YEAR_5:
      return [new Date(Date.parse(upperRange.toString()) - 5 * 365 * 24 * 3600 * 1000), upperRange];
    case RangeTypes.ALL:
    default:
      return [lowerRange, upperRange];
  }
};

export const RangeSelector: React.FC<{ setRange: (range: RangeTypes) => void }> = ({ setRange }) => {
  return (
    <Tabs light selected={6} className={styles['range-tabs']}>
      <Tab label="1 day" onClick={() => setRange(RangeTypes.DAY_1)}></Tab>
      <Tab label="5 days" onClick={() => setRange(RangeTypes.DAY_5)}></Tab>
      <Tab label="1 month" onClick={() => setRange(RangeTypes.MONTH_1)}></Tab>
      <Tab label="6 months" onClick={() => setRange(RangeTypes.MONTH_6)}></Tab>
      <Tab label="1 year" onClick={() => setRange(RangeTypes.YEAR_1)}></Tab>
      <Tab label="5 years" onClick={() => setRange(RangeTypes.YEAR_5)}></Tab>
      <Tab label="All" onClick={() => setRange(RangeTypes.ALL)}></Tab>
    </Tabs>
  );
};
