import React from 'react';

import Button from 'carbon-components-react/es/components/Button';
import DataTableSkeleton from 'carbon-components-react/es/components/DataTableSkeleton';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';

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

const RecentOverview: React.FC<RecentOverviewProps> = ({ patientUuid, basePath }) => {
  const { t } = useTranslation();
  const cardTitle = t('recentResults', 'Recent Results');
  const { overviewData, loaded, error } = useOverviewData(patientUuid);

  return (
    <RecentResultsGrid>
      {loaded ? (
        <>
          {(() => {
            if (overviewData.length) {
              return (
                <div className={styles.widgetCard}>
                  <div className={styles['recent-overview-header-container']}>
                    <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>
                      {cardTitle} ({Math.min(RECENT_COUNT, overviewData.length)})
                    </h4>
                    <Button kind="ghost" onClick={() => navigateToResults(basePath)}>
                      {t('all_results', 'All results')}
                    </Button>
                  </div>
                  <CommonOverview
                    {...{
                      patientUuid,
                      overviewData: overviewData.slice(0, RECENT_COUNT),
                      insertSeparator: true,
                      openTimeline: (panelUuid) => navigateToTimeline(basePath, panelUuid),
                      openTrendline: (panelUuid, testUuid) => navigateToTrendline(basePath, panelUuid, testUuid),
                    }}
                  />
                </div>
              );
            } else {
              return <EmptyState headerTitle={cardTitle} displayText={t('recentTestResults', 'recent test results')} />;
            }
          })()}
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
