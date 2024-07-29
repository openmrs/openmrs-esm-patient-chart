import React from 'react';
import useOverviewData from './useOverviewData';
import CommonOverview from './common-overview.component';
import { Button, DataTableSkeleton } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { navigateToResults, navigateToTimeline, navigateToTrendline } from '../helpers';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './recent-overview.scss';

const RECENT_COUNT = 5;

interface RecentOverviewProps {
  patientUuid: string;
  basePath: string;
}

const RecentOverview: React.FC<RecentOverviewProps> = ({ patientUuid, basePath }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const cardTitle = t('recentResults', 'Recent Results');
  const { overviewData, loaded } = useOverviewData(patientUuid);

  return (
    <RecentResultsGrid>
      {loaded ? (
        <>
          {(() => {
            if (overviewData.length) {
              const resultsCount = Math.min(RECENT_COUNT, overviewData.length);
              return (
                <div className={styles.widgetCard}>
                  <div className={isTablet ? styles.tabletHeader : styles.desktopHeader}>
                    <h4>{`${cardTitle} (${resultsCount})`}</h4>
                    <Button
                      kind="ghost"
                      onClick={() => navigateToResults(basePath)}
                      iconDescription="See all results"
                      renderIcon={(props) => <ArrowRight size={24} {...props} />}
                    >
                      {t('seeAllResults', 'See all results')}
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
        <DataTableSkeleton columnCount={3} />
      )}
    </RecentResultsGrid>
  );
};

const RecentResultsGrid = (props) => {
  return <div {...props} className={styles['recent-results-grid']} />;
};

export default RecentOverview;
export { RecentResultsGrid };
