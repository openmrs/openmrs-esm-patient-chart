import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList, TabPanel, TabPanels, Tag } from '@carbon/react';
import {
  type AssignedExtension,
  Extension,
  ExtensionSlot,
  formatTime,
  parseDate,
  useConfig,
  useConnectedExtensions,
  useLayoutType,
  type Visit,
} from '@openmrs/esm-framework';
import {
  type Order,
  type Encounter,
  type Note,
  type Observation,
  type OrderItem,
  type Diagnosis,
  mapEncounters,
} from '../visit.resource';
import VisitsTable from './visits-table/visits-table.component';
import MedicationSummary from './medications-summary.component';
import NotesSummary from './notes-summary.component';
import TestsSummary from './tests-summary.component';
import type { ExternalOverviewProps } from '@openmrs/esm-patient-common-lib';
import styles from './visit-summary.scss';
import getUniqueFormNames from '../../utils';
import { type ChartConfig } from '../../../config-schema';
import { OHRIForm } from '@openmrs/openmrs-form-engine-lib';
import groupBy from 'lodash/groupBy';

interface DiagnosisItem {
  diagnosis: string;
  order: string;
}

interface VisitSummaryProps {
  visit: Visit;
  patientUuid: string;
}

const visitSummaryPanelSlot = 'visit-summary-panels';

const VisitSummary: React.FC<VisitSummaryProps> = ({ visit, patientUuid }) => {
  const config = useConfig();
  const { t } = useTranslation();
  const layout = useLayoutType();
  const extensions = useConnectedExtensions(visitSummaryPanelSlot) as AssignedExtension[];
  const { showActiveVisitTab } = useConfig<ChartConfig>();

  const [diagnoses, notes, medications]: [Array<DiagnosisItem>, Array<Note>, Array<OrderItem>] = useMemo(() => {
    // Medication Tab
    const medications: Array<OrderItem> = [];
    // Diagnoses in a Visit
    const diagnoses: Array<DiagnosisItem> = [];
    // Notes Tab
    const notes: Array<Note> = [];

    // Iterating through every Encounter
    visit?.encounters?.forEach((enc: Encounter) => {
      // Orders of every encounter put in a single array.
      if (enc.hasOwnProperty('orders')) {
        medications.push(
          ...enc.orders.map((order: Order) => ({
            order,
            provider: {
              name: enc.encounterProviders.length ? enc.encounterProviders[0].provider.person.display : '',
              role: enc.encounterProviders.length ? enc.encounterProviders[0].encounterRole.display : '',
            },
          })),
        );
      }

      //Check if there is a diagnosis associated with this encounter
      if (enc.hasOwnProperty('diagnoses')) {
        if (enc.diagnoses.length > 0) {
          enc.diagnoses.forEach((diagnosis: Diagnosis) => {
            // Putting all the diagnoses in a single array.
            diagnoses.push({
              diagnosis: diagnosis.display,
              order: diagnosis.rank === 1 ? 'Primary' : 'Secondary',
            });
          });
        }
      }

      // Check for Visit Diagnoses and Notes
      if (enc.hasOwnProperty('obs')) {
        enc.obs.forEach((obs: Observation) => {
          if (config.notesConceptUuids?.includes(obs.concept.uuid)) {
            // Putting all notes in a single array.
            notes.push({
              note: obs.value,
              provider: {
                name: enc.encounterProviders.length ? enc.encounterProviders[0].provider.person.display : '',
                role: enc.encounterProviders.length ? enc.encounterProviders[0].encounterRole.display : '',
              },
              time: enc.encounterDatetime ? formatTime(parseDate(enc.encounterDatetime)) : '',
              concept: obs.concept,
            });
          }
        });
      }
    });

    return [diagnoses, notes, medications];
  }, [config.notesConceptUuids, visit?.encounters]);

  const testsFilter = useMemo<ExternalOverviewProps['filter']>(() => {
    const encounterIds = visit?.encounters.map((e) => `Encounter/${e.uuid}`);
    return ([entry]) => {
      return encounterIds.includes(entry.encounter?.reference);
    };
  }, [visit?.encounters]);

  const uniqueFormNames = getUniqueFormNames(visit);
  const groupedEncounters = groupBy(visit.encounters, 'encounterType.uuid');
  const [selectedTab, setSelectedTab] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleTabChange = (evt) => {
    setSelectedIndex(evt.selectedIndex);
  };

  useEffect(() => {
    if (!selectedTab && Object.keys(groupedEncounters)?.length > 0) {
      setSelectedTab(Object.keys(groupedEncounters)[0]);
    }
  }, [selectedTab]);

  return (
    <div className={styles.summaryContainer}>
      <p className={styles.diagnosisLabel}>{t('diagnoses', 'Diagnoses')}</p>
      <div className={styles.diagnosesList}>
        {diagnoses.length > 0 ? (
          diagnoses.map((diagnosis, i) => (
            <Tag key={i} type={diagnosis.order === 'Primary' ? 'red' : 'blue'}>
              {diagnosis.diagnosis}
            </Tag>
          ))
        ) : (
          <p className={classNames(styles.bodyLong01, styles.text02)} style={{ marginBottom: '0.5rem' }}>
            {t('noDiagnosesFound', 'No diagnoses found')}
          </p>
        )}
      </div>
      <Tabs
        onChange={handleTabChange}
        className={classNames(styles.verticalTabs, layout === 'tablet' ? styles.tabletTabs : styles.desktopTabs)}
      >
        <TabList aria-label="Visit summary tabs" className={styles.tablist}>
          <Tab
            className={classNames(styles.tab, styles.bodyLong01)}
            id="notes-tab"
            disabled={notes.length <= 0 && config.disableEmptyTabs}
          >
            {t('notes', 'Notes')}
          </Tab>
          <Tab className={styles.tab} id="tests-tab" disabled={testsFilter.length <= 0 && config.disableEmptyTabs}>
            {t('tests', 'Tests')}
          </Tab>
          <Tab
            className={styles.tab}
            id="medications-tab"
            disabled={medications.length <= 0 && config.disableEmptyTabs}
          >
            {t('medications', 'Medications')}
          </Tab>
          {showActiveVisitTab ? (
            uniqueFormNames?.length > 0 &&
            uniqueFormNames?.map((val: any, ind) => {
              return (
                <Tab
                  id={'tab-' + ind}
                  key={ind}
                  className={classNames(styles.tab, styles.bodyLong01)}
                  onClick={() => {
                    setSelectedTab(val.uuid);
                  }}
                >
                  {val.name}
                </Tab>
              );
            })
          ) : (
            <Tab
              className={styles.tab}
              id="encounters-tab"
              disabled={visit?.encounters.length <= 0 && config.disableEmptyTabs}
            >
              {t('encounters_title', 'Encounters')}
            </Tab>
          )}
          {extensions.map((extension, index) => (
            <Tab key={index} className={styles.tab} id={`${extension.meta.title || index}-tab`}>
              {t(extension.meta.title, {
                ns: extension.moduleName,
                defaultValue: extension.meta.title,
              })}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          <TabPanel>
            <NotesSummary notes={notes} />
          </TabPanel>
          <TabPanel>
            <TestsSummary patientUuid={patientUuid} encounters={visit?.encounters as Array<Encounter>} />
          </TabPanel>
          <TabPanel>
            <MedicationSummary medications={medications} />
          </TabPanel>
          {showActiveVisitTab ? (
            groupedEncounters[selectedTab]?.map((val: any, ind) =>
              val?.form && ind + 3 === selectedIndex ? (
                <TabPanel>
                  <OHRIForm patientUUID={patientUuid} formUUID={val.form?.uuid} encounterUUID={val.uuid} mode="view" />
                </TabPanel>
              ) : (
                <></>
              ),
            )
          ) : (
            <TabPanel>
              <VisitsTable visits={mapEncounters(visit)} showAllEncounters={false} patientUuid={patientUuid} />
            </TabPanel>
          )}
          <ExtensionSlot name={visitSummaryPanelSlot}>
            <TabPanel>
              <Extension state={{ patientUuid, visit }} />
            </TabPanel>
          </ExtensionSlot>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default VisitSummary;
