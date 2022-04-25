import React from 'react';
import { InlineLoading, Tab, Tabs } from 'carbon-components-react';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { formatDatetime, OpenmrsResource, parseDate } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { Observation, useVisits } from './visit.resource';
import EncounterList from './past-visits-components/encounter-list.component';
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

  if (isLoading) {
    return (
      <div className={styles.loader}>
        <InlineLoading description={t('loading', 'Loading...')} role="progressbar" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState headerTitle={t('encounters', 'encounters')} error={isError} />;
  }

  if (visits?.length) {
    const encounters = visits
      .filter((visit) => visit.encounters.length)
      .flatMap((visitWithEncounters) => mapEncounters(visitWithEncounters));

    return (
      <div className={styles.tabs}>
        <Tabs type="container">
          <Tab id="visit-summaries-tab" label={t('visitSummaries', 'Visit summaries')}>
            {visits.map((visit, i) => (
              <div className={styles.container} key={i}>
                <div className={styles.header}>
                  <h4 className={styles.visitType}>{visit?.visitType?.display}</h4>
                  <p className={styles.date}>{formatDatetime(parseDate(visit?.startDatetime))}</p>
                </div>
                <VisitSummary encounters={visit.encounters} patientUuid={patientUuid} />
              </div>
            ))}
          </Tab>
          <Tab id="all-encounters-tab" label={t('allEncounters', 'All encounters')}>
            <EncounterList encounters={encounters} showAllEncounters />
          </Tab>
        </Tabs>
      </div>
    );
  }
  return <EmptyState headerTitle={t('encounters', 'Encounters')} displayText={t('encounters', 'encounters')} />;
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
    visitUuid: visit?.visitType.uuid,
    visitType: visit?.visitType?.name,
  }));
}
