import { Button, ContentSwitcher, InlineLoading, Switch, Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import { ErrorState } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChartConfig } from '../../config-schema';
import VisitHistoryTable from '../visit-history-table/visit-history-table.component';
import VisitSummaries from './past-visits-components/visit-summaries.component';
import AllEncountersTable from './past-visits-components/encounters-table/all-encounters-table.component';
import styles from './visit-detail-overview.scss';
import { useInfiniteVisits } from './visit.resource';

interface VisitOverviewComponentProps {
  patientUuid: string;
}

function VisitDetailOverviewComponent({ patientUuid }: VisitOverviewComponentProps) {
  const { t } = useTranslation();

  // useInfiniteVisits is needed for the summary cards view and the "All encounters" table,
  // but not the visit table itself
  const { visits, error, hasMore, isLoading, isValidating, mutate, loadMore } = useInfiniteVisits(patientUuid);
  const [visitSummaryMode, setVisitSummaryMode] = useState<'table' | 'cards'>('cards');
  const [tabIndex, setTabIndex] = useState(0);
  const { showAllEncountersTab } = useConfig<ChartConfig>();

  const isShowingVisitHistoryTable = tabIndex == 0 && visitSummaryMode == 'table';
  return (
    <div className={styles.tabs}>
      <Tabs onChange={({ selectedIndex }) => setTabIndex(selectedIndex)} selectedIndex={tabIndex}>
        <TabList aria-label="Visit detail tabs" className={styles.tabList}>
          <Tab className={styles.tab} id="visit-summaries-tab">
            {t('Visits', 'Visits')}
          </Tab>
          {showAllEncountersTab ? (
            <Tab className={styles.tab} id="all-encounters-tab">
              {t('allEncounters', 'All encounters')}
            </Tab>
          ) : (
            <></>
          )}
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className={styles.contentSwitcherContainer}>
              <ContentSwitcher selectedIndex={1} onChange={(event) => setVisitSummaryMode(event.name)}>
                <Switch name="table" text={t('table', 'Table')} />
                <Switch name="cards" text={t('summaryCards', 'Summary cards')} />
              </ContentSwitcher>
            </div>
            {visitSummaryMode == 'table' && <VisitHistoryTable patientUuid={patientUuid} />}
            {visitSummaryMode == 'cards' && <VisitSummaries patientUuid={patientUuid} />}
          </TabPanel>
          {showAllEncountersTab && (
            <TabPanel>
              {isLoading ? (
                <InlineLoading description={`${t('loading', 'Loading')} ...`} role="progressbar" />
              ) : error ? (
                <ErrorState headerTitle={t('visits', 'visits')} error={error} />
              ) : (
                <AllEncountersTable patientUuid={patientUuid} />
              )}
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
      {/* The following button loads more data for both the visit summaries view and the "All encounters" table view,
          but not the visit history table view */}
      {hasMore && !isShowingVisitHistoryTable ? (
        <Button className={styles.loadMoreButton} disabled={isValidating} onClick={() => loadMore()}>
          {isValidating ? (
            <InlineLoading description={`${t('loading', 'Loading')} ...`} role="progressbar" />
          ) : (
            t('loadMore', 'Load more')
          )}
        </Button>
      ) : null}
    </div>
  );
}

export default VisitDetailOverviewComponent;
