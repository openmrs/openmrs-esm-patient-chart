import * as React from 'react';
import classNames from 'classnames';
import { formatDate, formatTime, parseDate, showModal } from '@openmrs/esm-framework';
import { type OBSERVATION_INTERPRETATION, getPatientUuidFromUrl } from '@openmrs/esm-patient-common-lib';
import { type ParsedTimeType } from '../filter/filter-types';
import type { ObsRecord } from '../../types';
import styles from './timeline.scss';

export const parseTime: (sortedTimes: Array<string>) => ParsedTimeType = (sortedTimes) => {
  const yearColumns: Array<{ year: string; size: number }> = [],
    dayColumns: Array<{ year: string; day: string; size: number }> = [],
    timeColumns: string[] = [];

  sortedTimes.forEach((datetime) => {
    const parsedDate = parseDate(datetime);
    const year = parsedDate.getFullYear().toString();
    const date = formatDate(parsedDate, { mode: 'wide', year: false, time: false });
    const time = formatTime(parsedDate);

    const yearColumn = yearColumns.find(({ year: innerYear }) => year === innerYear);
    if (yearColumn) yearColumn.size++;
    else yearColumns.push({ year, size: 1 });

    const dayColumn = dayColumns.find(({ year: innerYear, day: innerDay }) => date === innerDay && year === innerYear);
    if (dayColumn) dayColumn.size++;
    else dayColumns.push({ day: date, year, size: 1 });

    timeColumns.push(time);
  });

  return { yearColumns, dayColumns, timeColumns, sortedTimes };
};

export const Grid: React.FC<{
  children?: React.ReactNode;
  style: React.CSSProperties;
  padding?: boolean;
  dataColumns: number;
}> = ({ dataColumns, style = {}, padding = false, ...props }) => {
  const minColumnWidth = 4;
  const maxColumnWidth = 10;

  const dynamicColumnWidth = Math.max(minColumnWidth, Math.min(maxColumnWidth, 100 / dataColumns));

  return (
    <div
      style={{
        ...style,
        gridTemplateColumns: `${padding ? '9em ' : ''} repeat(${dataColumns}, ${dynamicColumnWidth}em)`,
        overflow: 'hidden',
      }}
      className={styles['grid']}
      {...props}
    />
  );
};

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
      className={classNames(
        styles['timeline-data-cell'],
        { [styles['timeline-cell-zebra']]: zebra },
        additionalClassname,
      )}
    >
      <p>{text}</p>
    </div>
  );
};

export const RowStartCell = ({ title, range, units, shadow = false, testUuid, isString = false }) => {
  const patientUuid = getPatientUuidFromUrl();
  const launchResultsDialog = (patientUuid: string, title: string, testUuid: string) => {
    const dispose = showModal('timeline-results-modal', {
      closeDeleteModal: () => dispose(),
      patientUuid,
      title,
      testUuid,
    });
  };

  return (
    <div
      className={styles['row-start-cell']}
      style={{
        boxShadow: shadow ? '8px 0 20px 0 rgba(0,0,0,0.15)' : undefined,
      }}
    >
      <span className={styles['trendline-link']}>
        {!isString ? (
          <span
            className={styles['trendline-link-view']}
            onClick={() => launchResultsDialog(patientUuid, title, testUuid)}
          >
            {title}
          </span>
        ) : (
          title
        )}
      </span>
      <span className={styles['range-units']}>
        {range} {units}
      </span>
    </div>
  );
};

export const TimeSlots: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}> = ({ children = undefined, ...props }) => (
  <TimeSlotsInner {...props}>
    <span>{children}</span>
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
      const interpretation = obs[i].interpretation;
      return <TimelineCell key={i} text={`${obs[i].value}`} interpretation={interpretation} zebra={zebra} />;
    })}
  </>
));
