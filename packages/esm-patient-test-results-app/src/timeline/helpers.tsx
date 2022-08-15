import * as React from 'react';
import { ObsRecord, OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import styles from './timeline.scss';

export const Grid: React.FC<{
  children?: React.ReactNode;
  style: React.CSSProperties;
  padding?: boolean;
  dataColumns: number;
}> = ({ dataColumns, style = {}, padding = false, ...props }) => (
  <div
    style={{
      ...style,
      gridTemplateColumns: `${padding ? '9em ' : ''} repeat(${dataColumns}, 5em)`,
      margin: '1px',
    }}
    className={styles['grid']}
    {...props}
  />
);

export const PaddingContainer = React.forwardRef<HTMLElement, any>((props, ref) => (
  <div ref={ref} className={styles['padding-container']} {...props} />
));

const TimeSlotsInner: React.FC<{
  style?: React.CSSProperties;
  className?: string;
}> = ({ className, ...props }) => (
  <div className={styles['time-slot-inner'] + (className ? ' ' + className : '')} {...props} />
);

export const Main: React.FC = () => <main className={styles['padded-main']} />;

export const ShadowBox: React.FC = () => <div className={styles['shadow-box']} />;

export const TimelineCell: React.FC<{
  text: string;
  interpretation?: OBSERVATION_INTERPRETATION;
  zebra: boolean;
}> = ({ text, interpretation = 'NORMAL', zebra }) => {
  let additionalClassname: string;

  switch (interpretation) {
    case 'OFF_SCALE_HIGH':
      additionalClassname = styles['off-scale-high'];
      break;

    case 'CRITICALLY_HIGH':
      additionalClassname = styles['critically-high'];
      break;

    case 'HIGH':
      additionalClassname = styles['high'];
      break;

    case 'OFF_SCALE_LOW':
      additionalClassname = styles['off-scale-low'];
      break;

    case 'CRITICALLY_LOW':
      additionalClassname = styles['critically-low'];
      break;

    case 'LOW':
      additionalClassname = styles['low'];
      break;

    case 'NORMAL':
    default:
      additionalClassname = '';
  }

  return (
    <div
      className={`${styles['timeline-data-cell']} ${zebra ? styles['timeline-cell-zebra'] : ''} ${additionalClassname}`}
    >
      <p>{text}</p>
    </div>
  );
};

export const RowStartCell = ({ title, range, units, shadow = false, openTrendline }) => (
  <div
    className={styles['row-start-cell']}
    style={{
      boxShadow: shadow ? '8px 0 20px 0 rgba(0,0,0,0.15)' : undefined,
    }}
  >
    <span className={styles['trendline-link']} onClick={openTrendline} role={'link'} tabIndex={0}>
      {title}
    </span>
    <span className={styles['range-units']}>
      {range} {units}
    </span>
  </div>
);

export const TimeSlots: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}> = ({ children = undefined, ...props }) => (
  <TimeSlotsInner {...props}>
    <div>{children}</div>
  </TimeSlotsInner>
);

export const GridItems = React.memo<{
  sortedTimes: Array<string>;
  obs: Array<ObsRecord>;
  zebra: boolean;
}>(({ sortedTimes, obs, zebra }) => (
  <>
    {sortedTimes.map((_, i) => {
      if (!obs[i]) return <TimelineCell key={i} text={'--'} zebra={zebra} />;
      const interpretation = obs[i].meta.assessValue(obs[i].value);
      return <TimelineCell key={i} text={obs[i].value} interpretation={interpretation} zebra={zebra} />;
    })}
  </>
));
