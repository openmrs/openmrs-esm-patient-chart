import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import FilterContext from '../filter/filter-context';
import TimelineDataGroup from './timeline-data-group.component';
import styles from './grouped-timeline.scss';

export const GroupedTimeline: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { activeTests, someChecked, timelineData, tableData } = useContext(FilterContext);
  const [xScroll, setXScroll] = useState(0);

  const {
    data: { rowData },
    loaded,
  } = timelineData;

  const visibleRows = useMemo(() => {
    if (!rowData) {
      return [];
    }

    if (!someChecked) {
      return rowData;
    }

    const activeTestsSet = new Set(activeTests);
    return rowData.filter((row) => activeTestsSet.has(row.flatName));
  }, [activeTests, rowData, someChecked]);

  const visiblePanels = useMemo(() => {
    if (!tableData) {
      return [];
    }

    const visibleRowNames = new Set(visibleRows.map((row) => row.flatName));
    const panels = tableData.filter((panel) => panel.entries.some((entry) => visibleRowNames.has(entry.flatName)));

    return panels.filter(
      (panel, index, allPanels) => index === allPanels.findIndex((p) => p.flatName === panel.flatName),
    );
  }, [tableData, visibleRows]);

  if (visibleRows.length === 0) {
    return <EmptyState displayText={t('data', 'data')} headerTitle={t('dataTimelineText', 'Data timeline')} />;
  }

  if (activeTests && timelineData && loaded && tableData) {
    return (
      <div className={styles.timelineDataContainer}>
        {visiblePanels.map((panel, index) => {
          // Filter rowData to only include tests that belong to this panel
          const panelTestNames = panel.entries.map((entry) => entry.flatName);
          const subRows = visibleRows.filter((row: { flatName: string }) => panelTestNames.includes(row.flatName));

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
