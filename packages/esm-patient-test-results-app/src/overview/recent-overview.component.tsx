import React from 'react';
import useOverviewData from './useOverviewData';
import CommonOverview from './common-overview';
import styles from './lab-results.scss';
import { Button, DataTableSkeleton } from 'carbon-components-react';
import { CardHeader, EmptyState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { RecentResultsGrid, Card } from './helpers';
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
              const resultsCount = Math.min(RECENT_COUNT, overviewData.length);
              return (
                <div className={styles.widgetCard}>
                  <CardHeader title={`${cardTitle} ${resultsCount}`}>
                    <Button kind="ghost" onClick={() => navigateToResults(basePath)}>
                      {t('allResults', 'All results')}
                    </Button>
                  </CardHeader>
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
