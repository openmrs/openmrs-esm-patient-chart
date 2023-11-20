import React from 'react';
import { InlineLoading, Tab, Tabs, TabList, TabPanel, TabPanels } from '@carbon/react';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { formatDatetime, parseDate, useConfig, ExtensionSlot } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import type { ChartConfig } from '../../config-schema';
import { mapEncounters, useVisits } from './visit.resource';
import VisitsTable from './past-visits-components/visits-table';
import VisitSummary from './past-visits-components/visit-summary.component';
import styles from './visit-detail-overview.scss';

interface VisitOverviewComponentProps {
  patientUuid: string;
}

function VisitDetailOverviewComponent({ patientUuid }: VisitOverviewComponentProps) {
  const { t } = useTranslation();
  const { visits, isError, isLoading, mutateVisits } = useVisits(patientUuid);
  const { showAllEncountersTab } = useConfig<ChartConfig>();

  const visitsWithEncounters = visits
    ?.filter((visit) => visit.encounters.length)
    ?.flatMap((visitWithEncounters) => {
      return mapEncounters(visitWithEncounters);
    });

  return (
    <div className={styles.tabs}>
      <Tabs>
        <TabList aria-label="Visit detail tabs" contained>
          <Tab className={styles.tab} id="visit-summaries-tab">
            {t('visitSummaries', 'Visit summaries')}
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
            {isLoading ? (
              <InlineLoading description={`${t('loading', 'Loading')} ...`} role="progressbar" />
            ) : isError ? (
              <ErrorState headerTitle={t('visits', 'visits')} error={isError} />
            ) : visits?.length ? (
              visits.map((visit, i) => (
                <div className={styles.container} key={i}>
                  <div className={styles.header}>
                    <div className={styles.visitInfo}>
                      <div>
                        <h4 className={styles.visitType}>{visit?.visitType?.display}</h4>
                        <div className={styles.displayFlex}>
                          <h6 className={styles.dateLabel}>{t('start', 'Start')}:</h6>
                          <span className={styles.date}>{formatDatetime(parseDate(visit?.startDatetime))}</span>
                          {visit?.stopDatetime ? (
                            <>
                              <h6 className={styles.dateLabel}>{t('end', 'End')}:</h6>
                              <span className={styles.date}>{formatDatetime(parseDate(visit?.stopDatetime))}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div>
                        <ExtensionSlot
                          name="visit-detail-overview-actions"
                          className={styles.visitDetailOverviewActions}
                          state={{ patientUuid, visit }}
                        />
                      </div>
                    </div>
                  </div>
                  <VisitSummary visit={visit} patientUuid={patientUuid} />
                </div>
              ))
            ) : (
              <EmptyState headerTitle={t('visits', 'visits')} displayText={t('Visits', 'Visits')} />
            )}
          </TabPanel>
          {showAllEncountersTab && (
            <TabPanel>
              {isLoading ? (
                <InlineLoading description={`${t('loading', 'Loading')} ...`} role="progressbar" />
              ) : isError ? (
                <ErrorState headerTitle={t('visits', 'visits')} error={isError} />
              ) : visits?.length ? (
                <VisitsTable
                  mutateVisits={mutateVisits}
                  visits={visitsWithEncounters}
                  showAllEncounters
                  patientUuid={patientUuid}
                />
              ) : (
                <EmptyState headerTitle={t('visits', 'visits')} displayText={t('Visits', 'Visits')} />
              )}
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </div>
  );
}

export default VisitDetailOverviewComponent;
