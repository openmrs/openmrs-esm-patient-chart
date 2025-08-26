import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { Grid } from './grid.component';
import type { DateHeaderGridProps, PanelNameCornerProps } from './grouped-timeline-types';
import FilterContext from '../filter/filter-context';
import styles from './grouped-timeline.scss';
import TimelineDataGroup from './timeline-data-group.component';

const TimeSlots: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}> = ({ children = undefined, className, ...props }) => (
  <div className={classNames(styles.timeSlotInner, className)} {...props}>
    <div>{children}</div>
  </div>
);

const PanelNameCorner: React.FC<PanelNameCornerProps> = ({ showShadow, panelName }) => (
  <TimeSlots className={classNames(styles.cornerGridElement, { [styles.shadow]: showShadow })}>{panelName}</TimeSlots>
);

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
    <div ref={ref} style={{ overflowX: 'auto' }} className={styles.dateHeaderInner}>
      <Grid
        dataColumns={timeColumns.length}
        style={{
          gridTemplateRows: 'repeat(3, 24px)',
          zIndex: 2,
          boxShadow: showShadow ? '8px 0 20px 0 rgba(0,0,0,0.15)' : undefined,
        }}
      >
        {yearColumns.map(({ year, size }) => {
          return (
            <TimeSlots key={year} className={styles.yearColumn} style={{ gridColumn: `${size} span` }}>
              {year}
            </TimeSlots>
          );
        })}
        {dayColumns.map(({ day, year, size }) => {
          return (
            <TimeSlots key={`${day} - ${year}`} className={styles.dayColumn} style={{ gridColumn: `${size} span` }}>
              {day}
            </TimeSlots>
          );
        })}
        {timeColumns.map((time, i) => {
          return (
            <TimeSlots key={time + i} className={styles.timeColumn}>
              {time}
            </TimeSlots>
          );
        })}
      </Grid>
    </div>
  );
};

export const GroupedTimeline: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { activeTests, timelineData, parents, checkboxes, someChecked, lowestParents } = useContext(FilterContext);
  const [panelName, setPanelName] = useState('');
  const [xScroll, setXScroll] = useState(0);
  const { t } = useTranslation();
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
    return <EmptyState displayText={t('data', 'data')} headerTitle={t('dataTimelineText', 'Data timeline')} />;
  }

  if (activeTests && timelineData && loaded) {
    return (
      <div className={styles.timelineHeader}>
        <div className={styles.nestedTimelineHeader}>
          <div className={styles.dateHeaderContainer}>
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
        <div className={styles.timelineDataContainer}>
          {lowestParents?.map((parent, index) => {
            if (parents[parent.flatName].some((kid) => checkboxes[kid]) || !someChecked) {
              shownGroups += 1;
              const subRows = someChecked
                ? rowData?.filter(
                    (row: { flatName: string }) =>
                      parents[parent.flatName].includes(row.flatName) && checkboxes[row.flatName],
                  )
                : rowData?.filter((row: { flatName: string }) => parents[parent.flatName].includes(row.flatName));

              return (
                subRows?.length > 0 && (
                  <TimelineDataGroup
                    patientUuid={patientUuid}
                    parent={parent}
                    subRows={subRows}
                    key={index}
                    xScroll={xScroll}
                    setXScroll={setXScroll}
                    panelName={panelName}
                    setPanelName={setPanelName}
                    groupNumber={shownGroups}
                  />
                )
              );
            } else return null;
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default GroupedTimeline;
