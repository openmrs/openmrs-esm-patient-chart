import React, { useContext } from 'react';
import { InlineLoading } from 'carbon-components-react';
import useScrollIndicator from './useScroll';
import { useManyTimelineData, usePatientPanels, useTimelineData } from './useTimelineData';
import {
  PaddingContainer,
  TimeSlots,
  Grid,
  RowStartCell,
  NewRowStartCell,
  GridItems,
  NewGridItems,
  ShadowBox,
} from './helpers';
import { ObsRecord, EmptyState } from '@openmrs/esm-patient-common-lib';
import styles from './timeline.scss';
import { RecentResultsGrid } from '../overview/recent-overview.component';
import FilterContext from '../filter/filter-context';

interface PanelNameCornerProps {
  showShadow: boolean;
  panelName: string;
}

const PanelNameCorner: React.FC<PanelNameCornerProps> = ({ showShadow, panelName }) => (
  <TimeSlots className={`${styles['corner-grid-element']} ${showShadow ? `${styles.shadow}` : ''}`}>
    {panelName}
  </TimeSlots>
);

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

interface DataRowsProps {
  rowData: Record<string, Array<ObsRecord>>;
  timeColumns: Array<string>;
  sortedTimes: Array<string>;
  showShadow: boolean;
  openTrendline: (testUuid: string) => void;
}

const DataRows: React.FC<DataRowsProps> = ({ timeColumns, rowData, sortedTimes, showShadow, openTrendline }) => (
  <Grid dataColumns={timeColumns.length} padding style={{ gridColumn: 'span 2' }}>
    {Object.entries(rowData).map(([title, obs], rowCount) => {
      const {
        meta: { units = '', range = '' },
        conceptClass,
      } = obs.find((x) => !!x);
      return (
        <React.Fragment key={conceptClass}>
          <RowStartCell
            {...{
              units,
              range,
              title,
              shadow: showShadow,
              openTrendline: () => openTrendline(conceptClass),
            }}
          />
          <GridItems {...{ sortedTimes, obs, zebra: !!(rowCount % 2) }} />
        </React.Fragment>
      );
    })}
  </Grid>
);
interface NewDataRowsProps {
  rowData: { entries: any[]; meta: { units: string; range: string } };
  timeColumns: Array<string>;
  sortedTimes: Array<string>;
  showShadow: boolean;
}

const NewDataRows: React.FC<NewDataRowsProps> = ({ timeColumns, rowData, sortedTimes, showShadow }) => (
  <Grid dataColumns={timeColumns.length} padding style={{ gridColumn: 'span 2' }}>
    {Object.entries(rowData).map(([title, row], rowCount) => {
      console.log('row', row);
      const obs = row.entries;
      const { units = '', range = '' } = row.meta;

      return (
        <React.Fragment key={rowCount}>
          <NewRowStartCell
            {...{
              units,
              range,
              title,
              shadow: showShadow,
            }}
          />
          <NewGridItems {...{ sortedTimes, obs, zebra: !!(rowCount % 2) }} />
        </React.Fragment>
      );
    })}
  </Grid>
);

interface TimelineParams {
  patientUuid: string;
  panelUuid?: string;
  openTrendline?: (panelUuid: string, testUuid: string) => void;
}

export const Timeline: React.FC<TimelineParams> = ({
  patientUuid,
  panelUuid,
  openTrendline: openTrendlineExternal,
}) => {
  const [xIsScrolled, yIsScrolled, containerRef] = useScrollIndicator(0, 32);
  const timelineData = useTimelineData(patientUuid, panelUuid);

  const {
    data: {
      parsedTime: { yearColumns, dayColumns, timeColumns, sortedTimes },
      rowData,
      panelName,
    },
    loaded,
  } = timelineData;

  const openTrendline = React.useCallback(
    (testUuid: string) => openTrendlineExternal(panelUuid, testUuid),
    [panelUuid, openTrendlineExternal],
  );

  if (!loaded)
    return (
      <RecentResultsGrid>
        <InlineLoading description="Loading" />
      </RecentResultsGrid>
    );

  if (yearColumns && dayColumns && timeColumns)
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
          <DataRows
            {...{
              timeColumns,
              rowData,
              sortedTimes,
              showShadow: xIsScrolled,
              panelUuid,
              openTrendline,
            }}
          />
          <ShadowBox />
        </PaddingContainer>
      </RecentResultsGrid>
    );
  return <EmptyState displayText={'timeline data'} headerTitle="Data Timeline" />;
};

export const MultiTimeline = ({ patientUuid }) => {
  const { data: panels } = usePatientPanels(patientUuid);
  const { activeTests } = useContext(FilterContext);

  const [xIsScrolled, yIsScrolled, containerRef] = useScrollIndicator(0, 32);

  const uuids = activeTests.map((test) => panels[test]);
  const timelineData = useManyTimelineData(patientUuid, uuids);

  const {
    data: {
      parsedTime: { yearColumns, dayColumns, timeColumns, sortedTimes },
      rowData,
      panelName,
    },
    loaded,
  } = timelineData;

  if (activeTests?.length === 0) {
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
};

export default Timeline;
