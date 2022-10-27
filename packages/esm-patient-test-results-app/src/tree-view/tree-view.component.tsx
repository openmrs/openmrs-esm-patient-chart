import React from 'react';
import { AccordionSkeleton, Column, DataTableSkeleton, Grid } from '@carbon/react';
import { useLayoutType } from '@openmrs/esm-framework';
import FilterSet from '../filter';
import GroupedTimeline from '../grouped-timeline';
import Trendline from '../trendline/trendline.component';
import styles from '../results-viewer/results-viewer.styles.scss';

interface TreeViewProps {
  patientUuid: string;
  basePath: string;
  testUuid: string;
  loading: boolean;
  expanded: boolean;
  type: string;
}

const TreeView: React.FC<TreeViewProps> = ({ patientUuid, basePath, testUuid, loading, expanded, type }) => {
  const tablet = useLayoutType() === 'tablet';
  return (
    <>
      {!tablet && (
        <Column sm={16} lg={tablet || expanded ? 0 : 5} className={`${styles.columnPanel} ${styles.treeColumn}`}>
          {!loading ? <FilterSet /> : <AccordionSkeleton open count={4} align="start" />}
        </Column>
      )}
      <Column sm={16} lg={tablet || expanded ? 12 : 7} className={`${styles.columnPanel}`}>
        {!tablet && testUuid && type === 'trendline' ? (
          <Trendline patientUuid={patientUuid} conceptUuid={testUuid} basePath={basePath} showBackToTimelineButton />
        ) : !loading ? (
          <GroupedTimeline />
        ) : (
          <DataTableSkeleton />
        )}
      </Column>
    </>
  );
};

export default TreeView;
