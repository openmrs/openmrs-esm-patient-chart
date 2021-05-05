import React from 'react';

import Button from 'carbon-components-react/lib/components/Button';
import DataTableSkeleton from 'carbon-components-react/lib/components/DataTableSkeleton';

import useOverviewData from './useOverviewData';
import { RecentResultsGrid, Card } from './helpers';
import styles from './lab-results.scss';
import CommonOverview from './common-overview';
import { navigateToResults, navigateToTimeline, navigateToTrendline } from '../helpers';

const RECENT_COUNT = 2;

interface RecentOverviewProps {
  patientUuid: string;
  basePath: string;
}

navigateToResults;

const RecentOverview: React.FC<RecentOverviewProps> = ({ patientUuid, basePath }) => {
  const { overviewData, loaded, error } = useOverviewData(patientUuid);

  return (
    <RecentResultsGrid>
      {loaded ? (
        <>
          <div className={styles['recent-overview-header-container']}>
            <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>
              Recent Results ({Math.min(RECENT_COUNT, overviewData.length)})
            </h4>
            <Button kind="ghost" onClick={() => navigateToResults(basePath)}>
              All results
            </Button>
          </div>
          <CommonOverview
            {...{
              patientUuid,
              overviewData: overviewData.slice(0, RECENT_COUNT),
              insertSeperator: true,
              openTimeline: (panelUuid) => navigateToTimeline(basePath, panelUuid),
              openTrendline: (panelUuid, testUuid) => navigateToTrendline(basePath, panelUuid, testUuid),
            }}
          />
        </>
      ) : (
        <Card>
          <DataTableSkeleton columnCount={3} />
        </Card>
      )}
    </RecentResultsGrid>
  );
};

export default RecentOverview;
