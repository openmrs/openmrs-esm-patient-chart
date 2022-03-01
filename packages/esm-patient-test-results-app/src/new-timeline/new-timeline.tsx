import React, { useContext } from 'react';
import useScrollIndicator from '../timeline/useScroll';
import { PaddingContainer, Grid, NewGridItems, ShadowBox } from '../timeline/helpers';
import { EmptyState, OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import FilterContext from '../filter/filter-context';
import styles from './new-timeline.scss';

const RecentResultsGrid = (props) => {
  return <div {...props} className={styles['recent-results-grid']} />;
};

const TimeSlotsInner: React.FC<{
  style?: React.CSSProperties;
  className?: string;
}> = ({ className, ...props }) => (
  <div className={styles['time-slot-inner'] + (className ? ' ' + className : '')} {...props} />
);

export const TimeSlots: React.FC<{
  style?: React.CSSProperties;
  className?: string;
}> = ({ children = undefined, ...props }) => (
  <TimeSlotsInner {...props}>
    <div>{children}</div>
  </TimeSlotsInner>
);

interface PanelNameCornerProps {
  showShadow: boolean;
  panelName: string;
}

const PanelNameCorner: React.FC<PanelNameCornerProps> = ({ showShadow, panelName }) => (
  <TimeSlots className={`${styles['corner-grid-element']} ${showShadow ? `${styles.shadow}` : ''}`}>
    {panelName}
  </TimeSlots>
);

interface DataEntry {
  value: number | string;
  effectiveDateTime: string;
  interpretation: OBSERVATION_INTERPRETATION;
}

interface DataRow {
  [_: string]: {
    entries: Array<DataEntry>;
    display: string;
    name: string;
    type: string;
    uuid: string;
    units: string;
    range: string;
  };
}

export const NewRowStartCell = ({ title, range, units, shadow = false }) => (
  <div
    className={styles['row-start-cell']}
    style={{
      boxShadow: shadow ? '8px 0 20px 0 rgba(0,0,0,0.15)' : undefined,
    }}
  >
    <span className={styles['trendline-link']}>{title}</span>
    <span className={styles['range-units']}>
      {range} {units}
    </span>
  </div>
);

interface NewDataRowsProps {
  rowData: DataRow;
  timeColumns: Array<string>;
  sortedTimes: Array<string>;
  showShadow: boolean;
}

const NewDataRows: React.FC<NewDataRowsProps> = ({ timeColumns, rowData, sortedTimes, showShadow }) => {
  return (
    <Grid dataColumns={timeColumns.length} padding style={{ gridColumn: 'span 2' }}>
      {Object.values(rowData).map((row, rowCount) => {
        const obs = row.entries;
        const { units = '', range = '' } = row;

        return (
          <React.Fragment key={rowCount}>
            <NewRowStartCell
              {...{
                units,
                range,
                title: row.display,
                shadow: showShadow,
              }}
            />
            <NewGridItems {...{ sortedTimes, obs, zebra: !!(rowCount % 2) }} />
          </React.Fragment>
        );
      })}
    </Grid>
  );
};

interface DateHeaderGridProps {
  timeColumns: Array<string>;
  yearColumns: Array<Record<string, number | string>>;
  dayColumns: Array<Record<string, number | string>>;
  showShadow: boolean;
}

const DateHeaderGrid: React.FC<DateHeaderGridProps> = ({ timeColumns, yearColumns, dayColumns, showShadow }) => (
  <Grid
    dataColumns={timeColumns.length}
    style={{
      gridTemplateRows: 'repeat(3, 24px)',
      position: 'sticky',
      top: '0px',
      zIndex: 2,
      boxShadow: showShadow ? '8px 0 20px 0 rgba(0,0,0,0.15)' : undefined,
    }}
  >
    {yearColumns.map(({ year, size }) => {
      return (
        <TimeSlots key={year} className={styles['year-column']} style={{ gridColumn: `${size} span` }}>
          {year}
        </TimeSlots>
      );
    })}
    {dayColumns.map(({ day, year, size }) => {
      return (
        <TimeSlots key={`${day} - ${year}`} className={styles['day-column']} style={{ gridColumn: `${size} span` }}>
          {day}
        </TimeSlots>
      );
    })}
    {timeColumns.map((time, i) => {
      return (
        <TimeSlots key={time + i} className={styles['time-column']}>
          {time}
        </TimeSlots>
      );
    })}
  </Grid>
);

export const NewTimeline = () => {
  const { activeTests, timelineData } = useContext(FilterContext);
  const [xIsScrolled, yIsScrolled, containerRef] = useScrollIndicator(0, 32);

  const {
    data: {
      parsedTime: { yearColumns, dayColumns, timeColumns, sortedTimes },
      rowData,
      panelName,
    },
    loaded,
  } = timelineData;

  if (rowData && Object.keys(rowData)?.length === 0) {
    return <EmptyState displayText={'timeline data'} headerTitle="Data Timeline" />;
  }
  if (activeTests && timelineData && loaded) {
    return (
      <RecentResultsGrid>
        <PaddingContainer ref={containerRef}>
          <PanelNameCorner showShadow={xIsScrolled} panelName={panelName} />
          <DateHeaderGrid
            {...{
              timeColumns,
              yearColumns,
              dayColumns,
              showShadow: yIsScrolled,
            }}
          />
          <NewDataRows
            {...{
              timeColumns,
              rowData,
              sortedTimes,
              showShadow: xIsScrolled,
            }}
          />
          <ShadowBox />
        </PaddingContainer>
      </RecentResultsGrid>
    );
  }
  return null;
};

export default NewTimeline;
