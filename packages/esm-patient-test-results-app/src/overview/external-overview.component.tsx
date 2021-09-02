import React, { useCallback } from 'react';
import { EmptyState, ExternalOverviewProps, PanelFilterProps } from '@openmrs/esm-patient-common-lib';
import DataTableSkeleton from 'carbon-components-react/es/components/DataTableSkeleton';
import useOverviewData, { parseSingleEntry, OverviewPanelEntry } from './useOverviewData';
import { RecentResultsGrid, Card } from './helpers';
import CommonOverview from './common-overview';
import usePatientResultsData from '../loadPatientTestData/usePatientResultsData';
import styles from './external-overview.component.scss';
import { useTranslation } from 'react-i18next';
import Button from 'carbon-components-react/es/components/Button';
import ArrowRight16 from '@carbon/icons-react/es/arrow--right/16';
import { navigate } from '@openmrs/esm-framework';

const resultsToShow = 5;

function useFilteredOverviewData(patientUuid: string, filter: (filterProps: PanelFilterProps) => boolean = () => true) {
  const { sortedObs, loaded, error } = usePatientResultsData(patientUuid);
  const [overviewData, setDisplayData] = React.useState<Array<OverviewPanelEntry>>([]);

  React.useEffect(() => {
    setDisplayData(
      Object.entries(sortedObs)
        .flatMap(([panelName, { entries, type, uuid }]) => {
          return entries.map((e) => [e, uuid, type, panelName] as PanelFilterProps);
        })
        .filter(filter)
        .map(([entry, uuid, type, panelName]: PanelFilterProps): OverviewPanelEntry => {
          return [panelName, type, parseSingleEntry(entry, type, panelName), new Date(entry.effectiveDateTime), uuid];
        })
        .sort(([, , , date1], [, , , date2]) => date2.getTime() - date1.getTime()),
    );
  }, [sortedObs]);

  return { overviewData, loaded, error };
}

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
                <div>
                  <div className={styles.externalOverviewHeader}>
                    <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{cardTitle}</h4>
                    <Button
                      kind="ghost"
                      renderIcon={ArrowRight16}
                      iconDescription="Add conditions"
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
