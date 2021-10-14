import React, { useCallback } from 'react';
import ArrowRight16 from '@carbon/icons-react/es/arrow--right/16';
import CommonOverview from './common-overview';
import styles from './external-overview.component.scss';
import useOverviewData from './useOverviewData';
import { EmptyState, ExternalOverviewProps } from '@openmrs/esm-patient-common-lib';
import { RecentResultsGrid, Card } from './helpers';
import { useTranslation } from 'react-i18next';
import { Button, DataTableSkeleton } from 'carbon-components-react';
import { navigate } from '@openmrs/esm-framework';

const resultsToShow = 5;

const RecentOverview: React.FC<ExternalOverviewProps> = ({ patientUuid, filter }) => {
  const { t } = useTranslation();
  const cardTitle = t('recentResults', 'Recent Results');
  const { overviewData, loaded, error } = useOverviewData(patientUuid);

  const handleSeeAll = useCallback(() => {
    navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/chart/test-results` });
  }, [patientUuid]);

  return (
    <RecentResultsGrid>
      {loaded ? (
        <>
          {(() => {
            if (overviewData.length) {
              return (
                <div className={styles.widgetCard}>
                  <div className={styles.externalOverviewHeader}>
                    <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{cardTitle}</h4>
                    <Button
                      kind="ghost"
                      renderIcon={ArrowRight16}
                      iconDescription="See all results"
                      onClick={handleSeeAll}>
                      {t('seeAllResults', 'See all results')}
                    </Button>
                  </div>
                  <CommonOverview
                    {...{
                      patientUuid,
                      overviewData: overviewData.slice(0, resultsToShow),
                      insertSeparator: true,
                      deactivateToolbar: true,
                      isPatientSummaryDashboard: true,
                    }}
                  />
                  {overviewData.length > resultsToShow && (
                    <Button onClick={handleSeeAll} kind="ghost">
                      {t('moreResultsAvailable', 'More results available')}
                    </Button>
                  )}
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
