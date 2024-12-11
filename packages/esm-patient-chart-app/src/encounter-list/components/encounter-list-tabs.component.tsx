import React from 'react';
import { useConfig, usePatient, useVisit } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { Tabs, Tab, TabList, TabPanels, TabPanel } from '@carbon/react';
import { EncounterList } from './encounter-list.component';
import { getMenuItemTabsConfiguration } from '../utils/encounter-list-config-builder';
import styles from './encounter-list-tabs.scss';
import { filter } from '../utils/helpers';

interface EncounterListTabsComponentProps {
  patientUuid: string;
}

const EncounterListTabsComponent: React.FC<EncounterListTabsComponentProps> = ({ patientUuid }) => {
  const config = useConfig();
  const { tabDefinitions = [] } = config;
  const { t } = useTranslation();
  const tabsConfig = getMenuItemTabsConfiguration(tabDefinitions);
  const patient = usePatient(patientUuid);
  const { currentVisit } = useVisit(patientUuid);

  return (
    <div className={styles.tabContainer}>
      <Tabs>
        <TabList contained>
          {tabsConfig.map((tab) => (
            <Tab key={tab.name}>{t(tab.name)}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabsConfig.map((tab) => (
            <TabPanel key={tab.name}>
              <EncounterList
                filter={tab.hasFilter ? (encounter) => filter(encounter, tab.formList[0].uuid) : null}
                patientUuid={patientUuid}
                formList={tab.formList}
                columns={tab.columns}
                encounterType={tab.encounterType}
                launchOptions={tab.launchOptions}
                headerTitle={tab.headerTitle}
                description={tab.description}
                currentVisit={currentVisit}
                deathStatus={patient?.patient?.deceasedBoolean}
              />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default EncounterListTabsComponent;
