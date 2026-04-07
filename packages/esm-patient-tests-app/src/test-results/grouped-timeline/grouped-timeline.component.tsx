import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import FilterContext from '../filter/filter-context';
import TimelineDataGroup from './timeline-data-group.component';
import styles from './grouped-timeline.scss';

export const GroupedTimeline: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { activeTests, timelineData, tableData } = useContext(FilterContext);
  const [xScroll, setXScroll] = useState(0);

  const {
    data: { rowData },
    loaded,
  } = timelineData;

  if (rowData && rowData?.length === 0) {
    return <EmptyState displayText={t('data', 'data')} headerTitle={t('dataTimelineText', 'Data timeline')} />;
  }

  if (activeTests && timelineData && loaded && tableData) {
    return (
      <div className={styles.timelineDataContainer}>
        {tableData.map((panel, index) => {
          // Filter rowData to only include tests that belong to this panel
          const panelTestNames = panel.entries.map((entry) => entry.flatName);
          const subRows = rowData?.filter((row: { flatName: string }) => panelTestNames.includes(row.flatName));

          return (
            subRows?.length > 0 && (
              <div key={index}>
                <TimelineDataGroup
                  groupNumber={index + 1}
                  parent={{ display: panel.key, flatName: panel.key }}
                  patientUuid={patientUuid}
                  setXScroll={setXScroll}
                  subRows={subRows}
                  xScroll={xScroll}
                />
              </div>
            )
          );
        })}
      </div>
    );
  }
  return null;
};

export default GroupedTimeline;
