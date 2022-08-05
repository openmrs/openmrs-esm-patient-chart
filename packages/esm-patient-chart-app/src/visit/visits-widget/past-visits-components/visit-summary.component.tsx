import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList, TabPanel, TabPanels, Tag } from '@carbon/react';
import { formatTime, OpenmrsResource, parseDate, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { Order, Encounter, Note, Observation, OrderItem } from '../visit.resource';
import EncounterList from './encounter-list.component';
import MedicationSummary from './medications-summary.component';
import NotesSummary from './notes-summary.component';
import TestsSummary from './tests-summary.component';
import styles from './visit-summary.scss';

interface DiagnosisItem {
  diagnosis: string;
  order: string;
}

interface VisitSummaryProps {
  encounters: Array<Encounter | OpenmrsResource>;
  patientUuid: string;
}

export interface MappedEncounter {
  id: string;
  datetime: string;
  encounterType: string;
  form: OpenmrsResource;
  obs: Array<Observation>;
  provider: string;
  visitUuid?: string;
}

const VisitSummary: React.FC<VisitSummaryProps> = ({ encounters, patientUuid }) => {
  const config = useConfig();
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);
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

      // Check for Visit Diagnoses and Notes
      enc.obs.forEach((obs: Observation) => {
        if (obs.concept.uuid === config.visitDiagnosisConceptUuid) {
          // Putting all the diagnoses in a single array.
          diagnoses.push({
            diagnosis: obs.groupMembers?.find((mem) => mem.concept.uuid === config.problemListConceptUuid).value
              .display,
            order: obs.groupMembers?.find((mem) => mem.concept.uuid === config.diagnosisOrderConceptUuid).value.display,
          });
        } else if (config.notesConceptUuids?.includes(obs.concept.uuid)) {
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
  }, [
    config.diagnosisOrderConceptUuid,
    config.notesConceptUuids,
    config.problemListConceptUuid,
    config.visitDiagnosisConceptUuid,
    encounters,
  ]);

  return (
    <div className={styles.summaryContainer}>
      <p className={styles.diagnosisLabel}>{t('diagnoses', 'Diagnoses')}</p>
      <div className={styles.diagnosesList}>
        {diagnoses.length > 0 ? (
          diagnoses.map((diagnosis, i) => (
            <Tag key={i} type={diagnosis.order === 'Primary' ? 'blue' : 'red'}>
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
          <Tab className={`${styles.tab} ${styles.bodyLong01}`} id="notes-tab" onClick={() => setSelectedTab(0)}>
            {t('notes', 'Notes')}
          </Tab>
          <Tab className={styles.tab} id="tests-tab" onClick={() => setSelectedTab(1)}>
            {t('tests', 'Tests')}
          </Tab>
          <Tab className={styles.tab} id="medications-tab" onClick={() => setSelectedTab(2)}>
            {t('medications', 'Medications')}
          </Tab>
          <Tab className={styles.tab} id="encounters-tab" onClick={() => setSelectedTab(3)}>
            {t('encounters', 'Encounters')}
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
            <EncounterList encounters={mapEncounters(encounters)} showAllEncounters={false} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default VisitSummary;

export function mapEncounters(encounters) {
  return encounters?.map((encounter) => ({
    id: encounter?.uuid,
    datetime: encounter?.encounterDatetime,
    encounterType: encounter?.encounterType?.display,
    form: encounter?.form,
    obs: encounter?.obs,
    provider:
      encounter?.encounterProviders?.length > 0 ? encounter.encounterProviders[0].provider?.person?.display : '--',
  }));
}
