import React from 'react';
import classNames from 'classnames';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import { ErrorState, ExtensionSlot, usePatient } from '@openmrs/esm-framework';
import Loader from '../loader/loader.component';
import RdeVisitDashboard from '../visit/visits-widget/rde-visit-dashboard.component';
import styles from './rde-page.scss';

/**
 * The retrospective data entry (RDE) page. It shows the patient banner at the top and a set of tabs
 * below it. For now there is a single "Visits" tab rendering the RDE visit dashboard.
 */
const RdePage: React.FC = () => {
  const { patientUuid } = useParams();

  // Key by patientUuid so the page (and its patient/visit state) is re-created when switching patients.
  return <RdePageContent key={patientUuid} patientUuid={patientUuid} />;
};

interface RdePageContentProps {
  patientUuid: string;
}

const RdePageContent: React.FC<RdePageContentProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { patient, isLoading: isLoadingPatient, error: patientError } = usePatient(patientUuid);

  return (
    <main className={classNames('omrs-main-content', styles.container)}>
      {isLoadingPatient ? (
        <Loader />
      ) : patientError || !patient ? (
        <ErrorState error={patientError} headerTitle={t('retrospectiveDataEntry', 'Retrospective data entry')} />
      ) : (
        <>
          <aside>
            <ExtensionSlot name="patient-header-slot" state={{ isLoadingPatient, patient, patientUuid }} />
          </aside>
          <Tabs>
            <TabList aria-label={t('retrospectiveDataEntryTabs', 'Retrospective data entry tabs')}>
              <Tab>{t('Visits', 'Visits')}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel className={styles.tabPanel}>
                <RdeVisitDashboard patient={patient} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      )}
    </main>
  );
};

export default RdePage;
