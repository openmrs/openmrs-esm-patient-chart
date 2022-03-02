import React, { useContext } from 'react';
import useScrollIndicator from '../timeline/useScroll';
import { PaddingContainer, Grid, ShadowBox } from '../timeline/helpers';
import { EmptyState, OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import FilterContext from '../filter/filter-context';
import styles from './new-timeline.scss';

const RecentResultsGrid = (props) => {
  return <div {...props} className={styles['recent-results-grid']} />;
};

const TimeSlots: React.FC<{
  style?: React.CSSProperties;
  className?: string;
}> = ({ children = undefined, className, ...props }) => (
  <div className={styles['time-slot-inner'] + (className ? ' ' + className : '')} {...props}>
    <div>{children}</div>
  </div>
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
  entries: Array<DataEntry>;
  display: string;
  name: string;
  type: string;
  uuid: string;
  units: string;
  range: string;
}

const NewRowStartCell = ({ title, range, units, shadow = false }) => (
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

const interpretationToCSS = {
  OFF_SCALE_HIGH: 'off-scale-high',
  CRITICALLY_HIGH: 'critically-high',
  HIGH: 'high',
  OFF_SCALE_LOW: 'off-scale-low',
  CRITICALLY_LOW: 'critically-low',
  LOW: 'low',
  NORMAL: '',
};

const TimelineCell: React.FC<{
  text: string;
  interpretation?: OBSERVATION_INTERPRETATION;
  zebra: boolean;
}> = ({ text, interpretation = 'NORMAL', zebra }) => {
  const additionalClassname: string = interpretationToCSS[interpretation]
    ? styles[interpretationToCSS[interpretation]]
    : '';

  return (
    <div
      className={`${styles['timeline-data-cell']} ${zebra ? styles['timeline-cell-zebra'] : ''} ${additionalClassname}`}
    >
      <p>{text}</p>
    </div>
  );
};

const NewGridItems = React.memo<{
  sortedTimes: Array<string>;
  obs: any;
  zebra: boolean;
}>(({ sortedTimes, obs, zebra }) => (
  <>
    {sortedTimes.map((_, i) => {
      if (!obs[i]) return <TimelineCell key={i} text={''} zebra={zebra} />;
      return <TimelineCell key={i} text={obs[i].value} interpretation={obs[i].interpretation} zebra={zebra} />;
    })}
  </>
));

interface NewDataRowsProps {
  rowData: DataRow[];
  timeColumns: Array<string>;
  sortedTimes: Array<string>;
  showShadow: boolean;
}

const NewDataRows: React.FC<NewDataRowsProps> = ({ timeColumns, rowData, sortedTimes, showShadow }) => {
  console.log('rowData??', rowData);
  return (
    <Grid dataColumns={timeColumns.length} padding style={{ gridColumn: 'span 2' }}>
      {rowData.map((row, index) => {
        const obs = row.entries;
        const { units = '', range = '' } = row;
        console.log('this should print?');
        return (
          <React.Fragment key={index}>
            <NewRowStartCell
              {...{
                units,
                range,
                title: row.display,
                shadow: showShadow,
              }}
            />
            <NewGridItems {...{ sortedTimes, obs, zebra: !!(index % 2) }} />
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
  const { activeTests, timelineData, parents, checkboxes, someChecked, lowestParents } = useContext(FilterContext);
  const [xIsScrolled, yIsScrolled, containerRef] = useScrollIndicator(0, 32);

  const {
    data: {
      parsedTime: { yearColumns, dayColumns, timeColumns, sortedTimes },
      rowData,
      panelName,
    },
    loaded,
  } = timelineData;

  if (rowData && rowData?.length === 0) {
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
          {lowestParents.map((parent) => {
            if (parents[parent.flatName].some((kid) => checkboxes[kid]) || !someChecked) {
              const subRows = someChecked
                ? rowData?.filter((row) => parents[parent.flatName].includes(row.flatName) && checkboxes[row.flatName])
                : rowData?.filter((row) => parents[parent.flatName].includes(row.flatName));

              // show kid rows
              return (
                <>
                  <div>{parent.display}</div>
                  <NewDataRows
                    {...{
                      timeColumns,
                      rowData: subRows,
                      sortedTimes,
                      showShadow: xIsScrolled,
                    }}
                  />
                </>
              );
            } else return null;
          })}
          {/* <NewDataRows
            {...{
              timeColumns,
              rowData,
              sortedTimes,
              showShadow: xIsScrolled,
            }}
          /> */}
          <ShadowBox />
        </PaddingContainer>
      </RecentResultsGrid>
    );
  }
  return null;
};

export default NewTimeline;
