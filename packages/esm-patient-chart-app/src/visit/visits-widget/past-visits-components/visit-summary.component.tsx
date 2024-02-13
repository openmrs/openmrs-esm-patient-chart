import React, { useMemo, useState } from 'react';
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
  useFeatureFlag,
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
import MedicationSummary from './medications-summary.component';
import NotesSummary from './notes-summary.component';
import TestsSummary from './tests-summary.component';
import type { ExternalOverviewProps } from '@openmrs/esm-patient-common-lib';
import styles from './visit-summary.scss';
import VisitsTable from './visits-table';

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

  const isactiveVisitSummaryTabEnabled = useFeatureFlag('activeVisitSummaryTab');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState(null);

  const handleTabChange = (evt) => {
    setSelectedTab(visit.encounters[evt.selectedIndex - 3]?.uuid || ''); // Assuming the first 3 tabs are predefined
    setSelectedIndex(evt.selectedIndex);
  };

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
        selected={selectedIndex}
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
          {!isactiveVisitSummaryTabEnabled ? (
            <Tab
              className={styles.tab}
              id="encounters-tab"
              disabled={visit?.encounters.length <= 0 && config.disableEmptyTabs}
            >
              {t('encounters_title', 'Encounters')}
            </Tab>
          ) : (
            visit?.encounters?.length > 0 &&
            visit?.encounters
              .filter((enc) => !!enc.form)
              .map((enc, ind) => (
                <Tab i id={'tab-' + ind} key={ind} className={classNames(styles.tab, styles.bodyLong01)}>
                  {enc?.form?.name ? enc?.form?.name : enc?.form?.display}
                </Tab>
              ))
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
          {!isactiveVisitSummaryTabEnabled ? (
            <TabPanel>
              <VisitsTable visits={mapEncounters(visit)} showAllEncounters={false} patientUuid={patientUuid} />
            </TabPanel>
          ) : (
            visit?.encounters?.length > 0 &&
            visit?.encounters
              .filter((enc) => !!enc.form)
              .map((enc, ind) => (
                <TabPanel key={ind}>
                  {selectedTab === enc.uuid && (
                    <ExtensionSlot
                      name="form-widget-slot"
                      state={{
                        additionalProps: { mode: 'embedded-view' },
                        formUuid: enc.form?.uuid,
                        encounterUuid: enc.uuid,
                        patientUuid: patientUuid,
                        promptBeforeClosing: () => {},
                      }}
                    />
                  )}
                </TabPanel>
              ))
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
