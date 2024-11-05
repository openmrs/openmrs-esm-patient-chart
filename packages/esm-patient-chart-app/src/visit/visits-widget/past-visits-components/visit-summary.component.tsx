import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, TabPanel, TabPanels, Tabs, Tag } from '@carbon/react';
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
  type Diagnosis,
  type Encounter,
  mapEncounters,
  type Note,
  type Observation,
  type Order,
  type OrderItem,
} from '../visit.resource';
import VisitsTable from './visits-table/visits-table.component';
import MedicationSummary from './medications-summary.component';
import NotesSummary from './notes-summary.component';
import TestsSummary from './tests-summary.component';
import type { ExternalOverviewProps } from '@openmrs/esm-patient-common-lib';
import styles from './visit-summary.scss';

interface DiagnosisItem {
  diagnosis: string;
  rank: number;
  type: string;
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

      // Check if there is a diagnosis associated with this encounter
      if (enc.hasOwnProperty('diagnoses')) {
        if (enc.diagnoses.length > 0) {
          enc.diagnoses.forEach((diagnosis: Diagnosis) => {
            // Putting all the diagnoses in a single array.
            diagnoses.push({
              diagnosis: diagnosis.display,
              type: diagnosis.rank === 1 ? 'red' : 'blue',
              rank: diagnosis.rank,
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

    // Sort the diagnoses by rank, so that primary diagnoses come first
    diagnoses.sort((a, b) => a.rank - b.rank);

    return [diagnoses, notes, medications];
  }, [config.notesConceptUuids, visit?.encounters]);

  const testsFilter = useMemo<ExternalOverviewProps['filter']>(() => {
    const encounterIds = visit?.encounters.map((e) => `Encounter/${e.uuid}`);
    return ([entry]) => {
      return encounterIds.includes(entry.encounter?.reference);
    };
  }, [visit?.encounters]);

  return (
    <div className={styles.summaryContainer}>
      <p className={styles.diagnosisLabel}>{t('diagnoses', 'Diagnoses')}</p>
      <div className={styles.diagnosesList}>
        {diagnoses.length > 0 ? (
          diagnoses.map((diagnosis, i) => (
            <Tag key={`${diagnosis.diagnosis}-${i}`} type={diagnosis.type}>
              {diagnosis.diagnosis}
            </Tag>
          ))
        ) : (
          <p className={classNames(styles.bodyLong01, styles.text02)} style={{ marginBottom: '0.5rem' }}>
            {t('noDiagnosesFound', 'No diagnoses found')}
          </p>
        )}
      </div>
      <Tabs className={classNames(styles.verticalTabs, layout === 'tablet' ? styles.tabletTabs : styles.desktopTabs)}>
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
          <Tab
            className={styles.tab}
            id="encounters-tab"
            disabled={visit?.encounters.length <= 0 && config.disableEmptyTabs}
          >
            {t('encounters_title', 'Encounters')}
          </Tab>
          {extensions?.map((extension, index) => (
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
          <TabPanel>
            <VisitsTable visits={mapEncounters(visit)} showAllEncounters={false} patientUuid={patientUuid} />
          </TabPanel>
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
