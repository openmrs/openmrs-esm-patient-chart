import { Button } from 'carbon-components-react';
import * as React from 'react';

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
    <div style={{ padding: '0rem 0rem 1rem 3rem' }}>
      <Button onClick={() => setRange(RangeTypes.DAY_1)}>1 day</Button>
      <Button onClick={() => setRange(RangeTypes.DAY_5)}>5 days</Button>
      <Button onClick={() => setRange(RangeTypes.MONTH_1)}>1 month</Button>
      <Button onClick={() => setRange(RangeTypes.MONTH_6)}>6 months</Button>
      <Button onClick={() => setRange(RangeTypes.YEAR_1)}>1 year</Button>
      <Button onClick={() => setRange(RangeTypes.YEAR_5)}>5 years</Button>
      <Button onClick={() => setRange(RangeTypes.ALL)}>Max</Button>
    </div>
  );
};
