import React, { useCallback, useContext, useEffect, useRef, useMemo } from 'react';
import classNames from 'classnames';
import { showModal } from '@openmrs/esm-framework';
import { Grid } from './grid.component';
import { makeThrottled } from '../helpers';
import type {
  TimelineCellProps,
  DataRowsProps,
  NewRowStartCellProps,
  TimelineDataGroupProps,
} from './grouped-timeline-types';
import FilterContext from '../filter/filter-context';
import styles from './grouped-timeline.scss';

export const ShadowBox: React.FC = () => <div className={styles['shadow-box']} />;

const TimeSlots: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}> = ({ children = undefined, className, ...props }) => (
  <div className={classNames(styles.timeSlotInner, className)} {...props}>
    {children}
  </div>
);

const PanelHeader: React.FC<{
  panelName: string;
  subRows: any[];
}> = ({ panelName, subRows }) => {
  // Calculate panel-specific dates from the actual data in this panel
  const panelDates = useMemo(() => {
    const allTimes = [
      ...new Set(
        subRows
          .filter((row) => row?.entries && Array.isArray(row.entries))
          .map((row) => row.entries.filter((entry) => entry).map((entry) => entry.obsDatetime))
          .flat(),
      ),
    ];

    allTimes.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const yearColumns: Array<{ year: string; size: number }> = [];
    const dayColumns: Array<{ year: string; day: string; size: number }> = [];
    const timeColumns: string[] = [];

    allTimes.forEach((datetime) => {
      const parsedDate = new Date(datetime);
      const year = parsedDate.getFullYear().toString();
      const date = parsedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const time = parsedDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const yearColumn = yearColumns.find(({ year: innerYear }) => year === innerYear);
      if (yearColumn) yearColumn.size++;
      else yearColumns.push({ year, size: 1 });

      const dayColumn = dayColumns.find(
        ({ year: innerYear, day: innerDay }) => date === innerDay && year === innerYear,
      );
      if (dayColumn) dayColumn.size++;
      else dayColumns.push({ day: date, year, size: 1 });

      timeColumns.push(time);
    });

    return { yearColumns, dayColumns, timeColumns };
  }, [subRows]);

  return (
    <div className={styles.panelHeader} data-panel-name={panelName}>
      <div className={styles.dateHeaderContainer}>
        <div className={styles.dateHeaderInner} style={{ overflowX: 'auto' }}>
          <Grid
            dataColumns={panelDates.timeColumns.length}
            padding={true}
            style={{
              gridTemplateRows: 'repeat(3, 24px)',
              zIndex: 1,
              boxShadow: '8px 0 20px 0 rgba(0,0,0,0.15)',
            }}
          >
            <TimeSlots className={classNames(styles.cornerGridElement, styles.shadow, styles.panelNameText)}>
              {panelName}
            </TimeSlots>
            {panelDates.yearColumns.map(({ year, size }) => (
              <TimeSlots key={year} className={styles.yearColumn} style={{ gridColumn: `${size} span` }}>
                {year}
              </TimeSlots>
            ))}
            {panelDates.dayColumns.map(({ day, year, size }) => (
              <TimeSlots key={`${day} - ${year}`} className={styles.dayColumn} style={{ gridColumn: `${size} span` }}>
                {day}
              </TimeSlots>
            ))}
            {panelDates.timeColumns.map((time, i) => (
              <TimeSlots key={time + i} className={styles.timeColumn}>
                {time}
              </TimeSlots>
            ))}
          </Grid>
        </div>
      </div>
    </div>
  );
};

const NewRowStartCell: React.FC<NewRowStartCellProps> = ({
  title,
  range,
  units,
  conceptUuid,
  patientUuid,
  shadow = false,
  isString = false,
}) => {
  const handleLaunchResultsModal = useCallback(() => {
    const dispose = showModal('timeline-results-modal', {
      closeDeleteModal: () => dispose(),
      patientUuid,
      testUuid: conceptUuid,
      title,
    });
  }, [patientUuid, conceptUuid, title]);

  return (
    <div
      className={styles.rowStartCell}
      style={{
        boxShadow: shadow ? '8px 0 20px 0 rgba(0,0,0,0.15)' : undefined,
      }}
    >
      <span className={styles['trendline-link']}>
        {!isString ? (
          <span className={styles['trendline-link-view']} onClick={handleLaunchResultsModal}>
            {title}
          </span>
        ) : (
          <span className={styles.trendlineLink}>{title}</span>
        )}
      </span>
      <span className={styles.rangeUnits}>
        {range} {units}
      </span>
    </div>
  );
};

const interpretationToCSS = {
  OFF_SCALE_HIGH: 'offScaleHigh',
  CRITICALLY_HIGH: 'criticallyHigh',
  HIGH: 'high',
  OFF_SCALE_LOW: 'offScaleLow',
  CRITICALLY_LOW: 'criticallyLow',
  LOW: 'low',
  NORMAL: '',
};

const TimelineCell: React.FC<TimelineCellProps> = ({ text, interpretation = 'NORMAL', zebra }) => {
  const additionalClassname: string = interpretationToCSS[interpretation]
    ? styles[interpretationToCSS[interpretation]]
    : '';

  return (
    <div className={classNames(styles.timelineDataCell, { [styles.timelineCellZebra]: zebra }, additionalClassname)}>
      <p>{text}</p>
    </div>
  );
};

const GridItems = React.memo<{
  sortedTimes: Array<string>;
  obs: any;
  zebra: boolean;
}>(({ sortedTimes, obs, zebra }) => (
  <>
    {sortedTimes.map((_, i) => {
      if (!obs[i]) {
        return <TimelineCell key={i} text={''} zebra={zebra} />;
      }

      return <TimelineCell key={i} text={obs[i].value} interpretation={obs[i].interpretation} zebra={zebra} />;
    })}
  </>
));

const DataRows: React.FC<DataRowsProps> = ({ patientUuid, timeColumns, rowData, sortedTimes, showShadow }) => {
  return (
    <Grid dataColumns={timeColumns.length} padding style={{ gridColumn: 'span 2' }}>
      {rowData.map((row, index) => {
        const obs = row.entries;
        const { units = '', range = '', obs: values } = row;
        const isString = isNaN(parseFloat(values?.[0]?.value));
        return (
          <React.Fragment key={index}>
            <NewRowStartCell
              {...{
                units,
                range,
                title: row.display,
                shadow: showShadow,
                conceptUuid: row.conceptUuid,
                patientUuid,
                isString,
              }}
            />
            <GridItems {...{ sortedTimes, obs, zebra: !!(index % 2) }} />
          </React.Fragment>
        );
      })}
    </Grid>
  );
};

export default function TimelineDataGroup({
  patientUuid,
  parent,
  subRows,
  xScroll,
  setXScroll,
}: TimelineDataGroupProps) {
  const { timelineData } = useContext(FilterContext);
  const {
    data: {
      parsedTime: { timeColumns, yearColumns, dayColumns, sortedTimes },
    },
  } = timelineData;

  const ref = useRef();

  const el: HTMLElement | null = ref.current;
  if (el) {
    el.scrollLeft = xScroll;
  }

  useEffect(() => {
    const handleScroll = makeThrottled((e) => {
      setXScroll(e.target.scrollLeft);
    }, 200);

    const div: HTMLElement | null = ref.current;
    if (div) {
      div.addEventListener('scroll', handleScroll);
      return () => div.removeEventListener('scroll', handleScroll);
    }
  }, [setXScroll]);

  return (
    <>
      <div>
        <PanelHeader panelName={parent.display} subRows={subRows} />
        <div className={styles.gridContainer} ref={ref}>
          <DataRows
            patientUuid={patientUuid}
            rowData={subRows}
            showShadow={Boolean(xScroll)}
            sortedTimes={sortedTimes}
            timeColumns={timeColumns}
          />
          <ShadowBox />
        </div>
      </div>
    </>
  );
}
