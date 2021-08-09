import React, { useCallback, useMemo } from 'react';
import { ExternalOverviewProps, PanelFilterProps } from '@openmrs/esm-patient-common-lib';
import DataTableSkeleton from 'carbon-components-react/es/components/DataTableSkeleton';
import { parseSingleEntry, OverviewPanelEntry } from './useOverviewData';
import { RecentResultsGrid, Card } from './helpers';
import CommonOverview from './common-overview';
import usePatientResultsData from '../loadPatientTestData/usePatientResultsData';
import styles from './external-overview.component.scss';
import { useTranslation } from 'react-i18next';
import Button from 'carbon-components-react/es/components/Button';
import ArrowRight16 from '@carbon/icons-react/es/arrow--right/16';
import { navigate } from '@openmrs/esm-framework';

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
  const { overviewData, loaded, error } = useFilteredOverviewData(patientUuid, filter);

  const overViewDataResult = useMemo(() => overviewData?.splice(0, 2), [overviewData]);

  const handleSeeAll = useCallback(() => {
    navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/chart/test-results` });
  }, [patientUuid]);

  return (
    <RecentResultsGrid>
      {loaded ? (
        <div>
          <div className={styles.externalOverviewHeader}>
            <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{t('recentResults', 'Recent Results')}</h4>
            <Button kind="ghost" renderIcon={ArrowRight16} iconDescription="Add conditions" onClick={handleSeeAll}>
              {t('seeAllResults', 'See all results')}
            </Button>
          </div>
          <CommonOverview
            {...{
              patientUuid,
              overviewData: overViewDataResult,
              insertSeperator: true,
              deactivateToolbar: true,
            }}
          />
        </div>
      ) : (
        <Card>
          <DataTableSkeleton columnCount={3} />
        </Card>
      )}
    </RecentResultsGrid>
  );
};

export default RecentOverview;
