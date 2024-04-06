import React from 'react';
import { InlineLoading, Tab, Tabs, TabList, TabPanel, TabPanels } from '@carbon/react';
import { EmptyState, ErrorState } from '@openmrs/esm-patient-common-lib';
import { ExtensionSlot, formatDatetime, parseDate } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useVisits } from './visit.resource';
import VisitSummary from './past-visits-components/visit-summary.component';
import styles from './visit-detail-overview.scss';

interface ActiveVisitOverviewComponentProps {
  patientUuid: string;
}

function ActiveVisitDetailOverviewComponent({ patientUuid }: ActiveVisitOverviewComponentProps) {
  const { t } = useTranslation();
  const { visits, error, isLoading, mutateVisits } = useVisits(patientUuid);

  const activeVisits = visits?.filter((visit) => visit.stopDatetime === null);

  if (isLoading) {
    return (
      <InlineLoading
        status="active"
        iconDescription={t('loading', 'Loading')}
        description={t('loadingVisit', 'Loading active visits...')}
      />
    );
  }

  if (error) {
    return <ErrorState headerTitle={t('failedToLoadActiveVisits', 'Failed loading active visits')} error={error} />;
  }

  return (
    <div className={styles.tabs}>
      <Tabs>
        <TabList aria-label="Active visit tabs" contained>
          {activeVisits?.map((visit, index) => (
            <Tab label={visit?.visitType?.name} key={index} id={`${index}-id}`}>
              {t('activeVisitType', '{{visitType}} Visit', { visitType: visit?.visitType?.name })}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {activeVisits?.map((visit, index) => (
            <TabPanel key={index}>
              {visit && (
                <div className={styles.container}>
                  <div className={styles.header}>
                    <div className={styles.visitInfo}>
                      <div>
                        <h4 className={styles.visitType}>{visit.visitType.name}</h4>
                        <div className={styles.displayFlex}>
                          <h6 className={styles.dateLabel}>{t('start', 'Start')}:</h6>
                          <span className={styles.date}>{formatDatetime(parseDate(visit.startDatetime))}</span>
                          {visit.stopDatetime ? (
                            <>
                              <h6 className={styles.dateLabel}>{t('end', 'End')}:</h6>
                              <span className={styles.date}>{formatDatetime(parseDate(visit.stopDatetime))}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div>
                        <ExtensionSlot name="active-visit-actions" />
                      </div>
                    </div>
                  </div>
                  <VisitSummary visit={visit} patientUuid={patientUuid} />
                </div>
              )}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </div>
  );
}

export default ActiveVisitDetailOverviewComponent;
