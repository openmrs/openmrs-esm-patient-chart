import React, { useCallback, useContext, useEffect, useRef } from 'react';
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
  panelName,
  setPanelName,
  groupNumber,
}: TimelineDataGroupProps) {
  const { timelineData } = useContext(FilterContext);
  const {
    data: {
      parsedTime: { timeColumns, sortedTimes },
    },
  } = timelineData;

  const ref = useRef();
  const titleRef = useRef();

  const el: HTMLElement | null = ref.current;
  if (el) {
    el.scrollLeft = xScroll;
  }

  if (groupNumber === 1 && panelName === '') {
    setPanelName(parent.display);
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
        {groupNumber > 1 && (
          <div className={styles.rowHeader}>
            <h6 ref={titleRef}>{parent.display}</h6>
          </div>
        )}
        <div className={styles.gridContainer} ref={ref}>
          <DataRows
            patientUuid={patientUuid}
            timeColumns={timeColumns}
            rowData={subRows}
            sortedTimes={sortedTimes}
            showShadow={Boolean(xScroll)}
          />
          <ShadowBox />
        </div>
      </div>
    </>
  );
}
