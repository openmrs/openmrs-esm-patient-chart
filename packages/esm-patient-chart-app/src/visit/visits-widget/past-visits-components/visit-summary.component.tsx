import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList, TabPanel, TabPanels, Tag } from '@carbon/react';
import { formatTime, OpenmrsResource, parseDate, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { Order, Encounter, Note, Observation, OrderItem, Diagnosis } from '../visit.resource';
import VisitsTable from './visits-table/visits-table.component';
import MedicationSummary from './medications-summary.component';
import NotesSummary from './notes-summary.component';
import TestsSummary from './tests-summary.component';
import styles from './visit-summary.scss';
import { ExternalOverviewProps } from '@openmrs/esm-patient-common-lib';

interface DiagnosisItem {
  diagnosis: string;
  order: string;
}

interface VisitSummaryProps {
  encounters: Array<Encounter | OpenmrsResource>;
  patientUuid: string;
  visitUuid: string;
  visitTypeUuid: string;
  visitStartDatetime?: string;
  visitStopDatetime?: string;
}

export interface MappedEncounter {
  id: string;
  datetime: string;
  encounterType: string;
  form: OpenmrsResource;
  obs: Array<Observation>;
  provider: string;
  visitUuid: string;
  visitTypeUuid: string;
  visitStartDatetime?: string;
  visitStopDatetime?: string;
}

const VisitSummary: React.FC<VisitSummaryProps> = ({
  encounters,
  patientUuid,
  visitUuid,
  visitTypeUuid,
  visitStartDatetime,
  visitStopDatetime,
}) => {
  const config = useConfig();
  const { t } = useTranslation();
  const layout = useLayoutType();

  const [diagnoses, notes, medications]: [Array<DiagnosisItem>, Array<Note>, Array<OrderItem>] = useMemo(() => {
    // Medication Tab
    const medications: Array<OrderItem> = [];
    // Diagnoses in a Visit
    const diagnoses: Array<DiagnosisItem> = [];
    // Notes Tab
    const notes: Array<Note> = [];

    // Iterating through every Encounter
    encounters.forEach((enc: Encounter) => {
      // Orders of every encounter put in a single array.
      medications.push(
        ...enc.orders.map((order: Order) => ({
          order,
          provider: {
            name: enc.encounterProviders.length ? enc.encounterProviders[0].provider.person.display : '',
            role: enc.encounterProviders.length ? enc.encounterProviders[0].encounterRole.display : '',
          },
        })),
      );

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
    });

    return [diagnoses, notes, medications];
  }, [config.notesConceptUuids, encounters]);

  const testsFilter = useMemo<ExternalOverviewProps['filter']>(() => {
    const encounterIds = encounters.map((e) => `Encounter/${e.uuid}`);
    return ([entry]) => {
      return encounterIds.includes(entry.encounter?.reference);
    };
  }, [encounters]);

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
          <p className={`${styles.bodyLong01} ${styles.text02}`} style={{ marginBottom: '0.5rem' }}>
            {t('noDiagnosesFound', 'No diagnoses found')}
          </p>
        )}
      </div>
      <Tabs className={`${styles.verticalTabs} ${layout === 'tablet' ? styles.tabletTabs : styles.desktopTabs}`}>
        <TabList aria-label="Visit summary tabs" className={styles.tablist}>
          <Tab
            className={`${styles.tab} ${styles.bodyLong01}`}
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
          <Tab className={styles.tab} id="encounters-tab" disabled={encounters.length <= 0 && config.disableEmptyTabs}>
            {t('encounters_title', 'Encounters')}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <NotesSummary notes={notes} />
          </TabPanel>
          <TabPanel>
            <TestsSummary patientUuid={patientUuid} encounters={encounters as Array<Encounter>} />
          </TabPanel>
          <TabPanel>
            <MedicationSummary medications={medications} />
          </TabPanel>
          <TabPanel>
            <VisitsTable
              visits={mapEncounters(encounters, visitUuid, visitTypeUuid, visitStartDatetime, visitStopDatetime)}
              showAllEncounters={false}
              patientUuid={patientUuid}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default VisitSummary;

export function mapEncounters(encounters, visitUuid, visitTypeUuid, visitStartDatetime, visitStopDatetime) {
  return encounters?.map((encounter) => ({
    id: encounter?.uuid,
    datetime: encounter?.encounterDatetime,
    encounterType: encounter?.encounterType?.display,
    form: encounter?.form,
    obs: encounter?.obs,
    visitUuid: visitUuid,
    visitTypeUuid: visitTypeUuid,
    visitStartDatetime: visitStartDatetime,
    visitStopDatetime: visitStopDatetime,
    provider:
      encounter?.encounterProviders?.length > 0 ? encounter.encounterProviders[0].provider?.person?.display : '--',
  }));
}
