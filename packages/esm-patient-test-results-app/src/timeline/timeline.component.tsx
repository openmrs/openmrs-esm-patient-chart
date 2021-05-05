import * as React from 'react';
import useScrollIndicator from './useScroll';
import { useTimelineData } from './useTimelineData';
import { Main, PaddingContainer, TimeSlots, Grid, RowStartCell, GridItems, ShadowBox } from './helpers';
import { ObsRecord } from '../loadPatientTestData/types';
import styles from './timeline.scss';

const PanelNameCorner: React.FC<{ panelName: string }> = ({ panelName }) => (
  <TimeSlots className={styles['corner-grid-element']}>{panelName}</TimeSlots>
);

const DateHeaderGrid = ({ timeColumns, yearColumns, dayColumns, displayShadow }) => (
  <Grid
    dataColumns={timeColumns.length}
    style={{
      gridTemplateRows: 'repeat(3, 24px)',
      position: 'sticky',
      top: '0px',
      zIndex: 2,
      boxShadow: displayShadow ? '8px 0 20px 0 rgba(0,0,0,0.15)' : undefined,
    }}>
    {yearColumns.map(({ year, size }) => {
      return (
        <TimeSlots key={year} style={{ gridColumn: `${size} span` }}>
          {year}
        </TimeSlots>
      );
    })}
    {dayColumns.map(({ day, size }) => {
      return (
        <TimeSlots key={day} style={{ gridColumn: `${size} span` }}>
          {day}
        </TimeSlots>
      );
    })}
    {timeColumns.map((time, i) => {
      return (
        <TimeSlots key={time + i} style={{ scrollSnapAlign: 'start', fontWeight: 400 }}>
          {time}
        </TimeSlots>
      );
    })}
  </Grid>
);

const LoadingDisplay: React.FC = () => (
  <Main>
    <h1>Loading</h1>
  </Main>
);

const DataRows: React.FC<{
  rowData: Record<string, Array<ObsRecord>>;
  timeColumns: Array<string>;
  sortedTimes: Array<string>;
  displayShadow: boolean;
  openTrendline: (testUuid: string) => void;
}> = ({ timeColumns, rowData, sortedTimes, displayShadow, openTrendline }) => (
  <Grid dataColumns={timeColumns.length} padding style={{ gridColumn: 'span 2' }}>
    {Object.entries(rowData).map(([title, obs]) => {
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
              shadow: displayShadow,
              openTrendline: () => openTrendline(conceptClass),
            }}
          />
          <GridItems {...{ sortedTimes, obs }} />
        </React.Fragment>
      );
    })}
  </Grid>
);

type TimelineParams = {
  patientUuid: string;
  panelUuid: string;
  openTrendline: (panelUuid: string, testUuid: string) => void;
};

export const Timeline: React.FC<TimelineParams> = ({
  patientUuid,
  panelUuid,
  openTrendline: openTrendlineExternal,
}) => {
  const [xIsScrolled, yIsScrolled, containerRef] = useScrollIndicator(0, 32);

  const {
    data: {
      parsedTime: { yearColumns, dayColumns, timeColumns, sortedTimes },
      rowData,
      panelName,
    },
    loaded,
  } = useTimelineData(patientUuid, panelUuid);

  const openTrendline = React.useCallback((testUuid: string) => openTrendlineExternal(panelUuid, testUuid), [
    panelUuid,
    openTrendlineExternal,
  ]);

  if (!loaded) return <LoadingDisplay />;

  return (
    <PaddingContainer ref={containerRef}>
      <PanelNameCorner panelName={panelName} />
      <DateHeaderGrid
        {...{
          timeColumns,
          yearColumns,
          dayColumns,
          displayShadow: yIsScrolled,
        }}
      />
      <DataRows
        {...{
          timeColumns,
          rowData,
          sortedTimes,
          displayShadow: xIsScrolled,
          panelUuid,
          openTrendline,
        }}
      />
      <ShadowBox />
    </PaddingContainer>
  );
};
