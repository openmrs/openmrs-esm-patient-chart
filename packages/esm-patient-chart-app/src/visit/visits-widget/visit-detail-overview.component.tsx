import React from 'react';
import { InlineLoading, Tab, Tabs, TabList, TabPanel, TabPanels } from '@carbon/react';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { formatDatetime, OpenmrsResource, parseDate, useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { Observation, useVisits } from './visit.resource';
import { EncountersTableLifecycle } from './encounters-table/encounters-table.component';
import VisitsTable from './past-visits-components/visits-table';
import VisitSummary from './past-visits-components/visit-summary.component';
import styles from './visit-detail-overview.scss';

interface VisitOverviewComponentProps {
  patientUuid: string;
}

export interface FormattedEncounter {
  id: string;
  datetime: string;
  encounterType: string;
  form: OpenmrsResource;
  obs: Array<Observation>;
  provider: string;
  visitType: string;
  visitUuid: string;
}

function VisitDetailOverviewComponent({ patientUuid }: VisitOverviewComponentProps) {
  const { t } = useTranslation();
  const { visits, isError, isLoading } = useVisits(patientUuid);
  const { showAllEncountersTab } = useConfig();

  const visitsWithEncounters = visits
    ?.filter((visit) => visit.encounters.length)
    ?.flatMap((visitWithEncounters) => mapEncounters(visitWithEncounters));

  return (
    <div className={styles.tabs}>
      <Tabs>
        <TabList aria-label="Visit detail tabs" contained>
          <Tab className={styles.tab} id="visit-summaries-tab">
            {t('visitSummaries', 'Visit summaries')}
          </Tab>
          <Tab className={styles.tab} id="all-encounters-tab">
            {t('allVisits', 'All visits')}
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
              <InlineLoading description={t('loading', 'Loading...')} role="progressbar" />
            ) : isError ? (
              <ErrorState headerTitle={t('visits', 'visits')} error={isError} />
            ) : visits?.length ? (
              visits.map((visit, i) => (
                <div className={styles.container} key={i}>
                  <div className={styles.header}>
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
                  <VisitSummary
                    encounters={visit.encounters}
                    patientUuid={patientUuid}
                    visitUuid={visit.uuid}
                    visitTypeUuid={visit.visitType.uuid}
                  />
                </div>
              ))
            ) : (
              <EmptyState headerTitle={t('visits', 'visits')} displayText={t('Visits', 'Visits')} />
            )}
          </TabPanel>
          <TabPanel>
            {isLoading ? (
              <InlineLoading description={t('loading', 'Loading...')} role="progressbar" />
            ) : isError ? (
              <ErrorState headerTitle={t('visits', 'visits')} error={isError} />
            ) : visits?.length ? (
              <VisitsTable visits={visitsWithEncounters} showAllEncounters />
            ) : (
              <EmptyState headerTitle={t('visits', 'visits')} displayText={t('Visits', 'Visits')} />
            )}
          </TabPanel>
          {showAllEncountersTab ? (
            <TabPanel>
              <EncountersTableLifecycle patientUuid={patientUuid} />
            </TabPanel>
          ) : (
            <></>
          )}
        </TabPanels>
      </Tabs>
    </div>
  );
}

export default VisitDetailOverviewComponent;

export function mapEncounters(visit) {
  return visit?.encounters?.map((encounter) => ({
    id: encounter?.uuid,
    datetime: encounter?.encounterDatetime,
    encounterType: encounter?.encounterType?.display,
    form: encounter?.form,
    obs: encounter?.obs,
    provider:
      encounter?.encounterProviders?.length > 0 ? encounter.encounterProviders[0].provider?.person?.display : '--',
    visitUuid: visit?.uuid,
    visitType: visit?.visitType?.name,
    visitTypeUuid: visit?.visitType.uuid,
  }));
}
