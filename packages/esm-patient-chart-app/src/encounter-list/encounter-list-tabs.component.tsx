import React from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { Tabs, Tab, TabList, TabPanels, TabPanel } from '@carbon/react';
import { EncounterList } from './components/encounter-list.component';
import { getMenuItemTabsConfiguration } from './utils/encounter-list-config-builder';
import styles from './encounter-list-tabs.scss';

interface EncounterListTabsComponentProps {
  patientUuid: string;
  filter?: (encounter: any, formName?: string) => boolean;
}

const EncounterListTabsComponent: React.FC<EncounterListTabsComponentProps> = ({ patientUuid }) => {
  const config = useConfig();
  const { tabDefinitions = [] } = config;

  const tabsConfig = getMenuItemTabsConfiguration(tabDefinitions);
  const filter = (encounter, name) => false;

  return (
    <div className={styles.tabContainer}>
      <Tabs>
        <TabList contained>
          {tabsConfig.map((tab) => (
            <Tab key={tab.name}>{tab.name}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabsConfig.map((tab) => (
            <TabPanel key={tab.name}>
              <EncounterList
                filter={tab.hasFilter ? (encounter) => filter(encounter, tab.launchOptions[0].label) : null}
                patientUuid={patientUuid}
                formList={tab.formList}
                columns={tab.columns}
                encounterType={tab.encounterType}
                launchOptions={tab.launchOptions}
                headerTitle={tab.headerTitle}
                description={tab.description}
              />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default EncounterListTabsComponent;
