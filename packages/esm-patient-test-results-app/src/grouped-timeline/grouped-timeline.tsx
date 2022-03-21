import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Grid, ShadowBox } from '../timeline/helpers';
import { EmptyState, OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';
import FilterContext from '../filter/filter-context';
import styles from './grouped-timeline.styles.scss';
import { makeThrottled } from '../helpers';

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
  return (
    <Grid dataColumns={timeColumns.length} padding style={{ gridColumn: 'span 2' }}>
      {rowData.map((row, index) => {
        const obs = row.entries;
        const { units = '', range = '' } = row;
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
  xScroll: number;
  setXScroll: any;
}

const DateHeaderGrid: React.FC<DateHeaderGridProps> = ({
  timeColumns,
  yearColumns,
  dayColumns,
  showShadow,
  xScroll,
  setXScroll,
}) => {
  const ref = useRef();
  const el: HTMLElement | null = ref.current;

  if (el) {
    el.scrollLeft = xScroll;
  }

  const handleScroll = useCallback(
    (e) => {
      setXScroll(e.target.scrollLeft);
    },
    [setXScroll],
  );

  useEffect(() => {
    const div: HTMLElement | null = ref.current;
    if (div) {
      div.addEventListener('scroll', handleScroll);
      return () => div.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <div ref={ref} style={{ overflowX: 'auto' }} className={styles['date-header-inner']}>
      <Grid
        dataColumns={timeColumns.length}
        style={{
          gridTemplateRows: 'repeat(3, 24px)',
          //position: 'sticky',
          //top: '0px',
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
    </div>
  );
};

const TimelineDataGroup = ({ parent, subRows, xScroll, setXScroll, panelName, setPanelName, groupNumber }) => {
  const { timelineData } = useContext(FilterContext);
  const {
    data: {
      parsedTime: { timeColumns, sortedTimes },
      rowData,
    },
  } = timelineData;

  const ref = useRef();
  const titleRef = useRef();

  const el: HTMLElement | null = ref.current;
  if (groupNumber === 1 && panelName === '') {
    setPanelName(parent.display);
  }

  if (el) {
    el.scrollLeft = xScroll;
  }

  const handleScroll = makeThrottled((e) => {
    setXScroll(e.target.scrollLeft);
  }, 200);

  useEffect(() => {
    const div: HTMLElement | null = ref.current;
    if (div) {
      div.addEventListener('scroll', handleScroll);
      return () => div.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const onIntersect = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0.5) {
        //setPanelName(parent.display);
      }
    });
  };

  const observer = new IntersectionObserver(onIntersect, {
    root: null,
    threshold: 0.5,
  });
  if (titleRef.current) {
    observer.observe(titleRef.current);
  }

  return (
    <>
      <div>
        {groupNumber > 1 && (
          <div className={styles['row-header']}>
            <h6 ref={titleRef}>{parent.display}</h6>
          </div>
        )}
        <div className={styles['grid-container']} ref={ref}>
          <NewDataRows
            {...{
              timeColumns,
              rowData: subRows,
              sortedTimes,
              showShadow: Boolean(xScroll),
            }}
          />
          <ShadowBox />
        </div>
      </div>
      <div style={{ height: '2em' }}></div>
    </>
  );
};

export const GroupedTimeline = () => {
  const { activeTests, timelineData, parents, checkboxes, someChecked, lowestParents } = useContext(FilterContext);
  const [panelName, setPanelName] = useState('');
  const [xScroll, setXScroll] = useState(0);
  let shownGroups = 0;

  const {
    data: {
      parsedTime: { yearColumns, dayColumns, timeColumns },
      rowData,
    },
    loaded,
  } = timelineData;

  useEffect(() => {
    setPanelName('');
  }, [rowData]);

  if (rowData && rowData?.length === 0) {
    return <EmptyState displayText={'timeline data'} headerTitle="Data Timeline" />;
  }
  if (activeTests && timelineData && loaded) {
    return (
      <>
        <div className={styles['date-header']}>
          <div className={styles['date-header-container']}>
            <PanelNameCorner showShadow={true} panelName={panelName} />
            <DateHeaderGrid
              {...{
                timeColumns,
                yearColumns,
                dayColumns,
                showShadow: true,
                xScroll,
                setXScroll,
              }}
            />
          </div>
        </div>
        <div>
          {lowestParents?.map((parent, index) => {
            if (parents[parent.flatName].some((kid) => checkboxes[kid]) || !someChecked) {
              shownGroups += 1;
              const subRows = someChecked
                ? rowData?.filter((row) => parents[parent.flatName].includes(row.flatName) && checkboxes[row.flatName])
                : rowData?.filter((row) => parents[parent.flatName].includes(row.flatName));

              // show kid rows
              return (
                <TimelineDataGroup
                  parent={parent}
                  subRows={subRows}
                  key={index}
                  xScroll={xScroll}
                  setXScroll={setXScroll}
                  panelName={panelName}
                  setPanelName={setPanelName}
                  groupNumber={shownGroups}
                />
              );
            } else return null;
          })}
        </div>
      </>
    );
  }
  return null;
};

export default GroupedTimeline;
