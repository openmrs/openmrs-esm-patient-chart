import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, Tab, TabList, TabPanels, TabPanel } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import { EncounterList } from './encounter-list.component';
import { getMenuItemTabsConfiguration } from '../utils/encounter-list-config-builder';
import styles from './encounter-list-tabs.scss';
import { filter } from '../utils/helpers';
import { type Encounter } from '../types';

interface EncounterListTabsComponentProps {
  patientUuid: string;
  patient: fhir.Patient;
}

const EncounterListTabsComponent: React.FC<EncounterListTabsComponentProps> = ({ patientUuid, patient }) => {
  const { t } = useTranslation();
  const { currentVisit } = usePatientChartStore().visits;

  const config = useConfig();
  const { tabDefinitions = [] } = config;

  const configConcepts = {
    trueConceptUuid: config.trueConceptUuid,
    falseConceptUuid: config.falseConceptUuid,
    otherConceptUuid: config.otherConceptUuid,
  };

  const tabsConfig = getMenuItemTabsConfiguration(tabDefinitions, configConcepts);

  const tabFilters = useMemo(() => {
    return tabsConfig.reduce((result, tab) => {
      if (tab.hasFilter) {
        result[tab.name] = (encounter: Encounter) => filter(encounter, tab.formList?.[0]?.uuid);
      }
      return result;
    }, {});
  }, [tabsConfig]);

  const isDead = patient.deceasedBoolean ?? Boolean(patient.deceasedDateTime);

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
                filter={tabFilters[tab.name]}
                patientUuid={patientUuid}
                formList={tab.formList}
                columns={tab.columns}
                encounterType={tab.encounterType}
                launchOptions={tab.launchOptions}
                headerTitle={tab.headerTitle}
                description={tab.description}
                currentVisit={currentVisit}
                deathStatus={isDead}
              />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default EncounterListTabsComponent;
