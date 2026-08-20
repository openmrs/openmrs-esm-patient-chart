import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import type { ChartConfig } from '../../config-schema';
import AllEncountersTable from './past-visits-components/encounters-table/all-encounters-table.component';
import CompletedFormsTable from './past-visits-components/encounters-table/completed-forms-table.component';
import VisitHistoryTable from '../visit-history-table/visit-history-table.component';
import styles from './visit-detail-overview.scss';

interface VisitOverviewComponentProps {
  patientUuid: string;
  patient: fhir.Patient;
}

function VisitDetailOverviewComponent({ patientUuid, patient }: VisitOverviewComponentProps) {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);
  const { showAllEncountersTab } = useConfig<ChartConfig>();

  const completedFormsTabIndex = showAllEncountersTab ? 2 : 1;

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
          <Tab className={styles.tab} id="completed-forms-tab">
            {t('completedForms', 'Completed forms')}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <VisitHistoryTable patientUuid={patientUuid} patient={patient} />
          </TabPanel>
          {showAllEncountersTab && (
            <TabPanel>
              <AllEncountersTable patientUuid={patientUuid} />
            </TabPanel>
          )}
          <TabPanel>
            <CompletedFormsTable patientUuid={patientUuid} isTabActive={tabIndex === completedFormsTabIndex} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}

export default VisitDetailOverviewComponent;
