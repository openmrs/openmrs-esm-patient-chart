import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Tabs from 'carbon-components-react/es/components/Tabs';
import Tab from 'carbon-components-react/es/components/Tab';
import dayjs from 'dayjs';
import { Medication, Encounter, Note, Observation, MedicationItem } from '../visit.resource';
import styles from '../visit-detail-overview.scss';
import MedicationSummary from './medications-summary.component';
import NotesSummary from './notes-summary.component';
import TestsSummary from './tests-summary.component';
import { OpenmrsResource } from '@openmrs/esm-framework';

function formatTime(date) {
  return dayjs(date).format('hh:mm');
}

interface DiagnosisItem {
  diagnosis: string;
  order: string;
}

interface VisitSummaryProps {
  encounters: Array<Encounter | OpenmrsResource>;
}

const VisitSummary: React.FC<VisitSummaryProps> = ({ encounters }) => {
  const { t } = useTranslation();
  const [tabSelected, setSelectedTab] = useState(0);

  const [diagnoses, notes, tests, medications]: [Array<DiagnosisItem>, Array<Note>, any, Array<MedicationItem>] =
    useMemo(() => {
      // Medication Tab
      let medications: Array<MedicationItem> = [];
      // Diagnoses in a Visit
      let diagnoses: Array<DiagnosisItem> = [];
      // Notes Tab
      let notes: Array<Note> = [];
      // Tests Tabs
      let tests = [];

      // Iterating through every Encounter
      encounters.forEach((enc: Encounter) => {
        // Orders of every encounter put in a single array.
        medications = medications.concat(
          enc.orders.map((order: Medication) => ({
            order,
            provider: {
              name: enc.encounterProviders.length ? enc.encounterProviders[0].provider.person.display : '',
              role: enc.encounterProviders.length ? enc.encounterProviders[0].encounterRole.display : '',
            },
          })),
        );

        // Check for Visit Diagnoses and Notes
        if (enc.encounterType.display === 'Visit Note') {
          enc.obs.forEach((obs: Observation) => {
            if (obs.concept.display === 'Visit Diagnoses') {
              // Putting all the diagnoses in a single array.
              diagnoses.push({
                diagnosis: obs.groupMembers.find((mem) => mem.concept.display === 'PROBLEM LIST').value.display,
                order: obs.groupMembers.find((mem) => mem.concept.display === 'Diagnosis order').value.display,
              });
            } else if (obs.concept.display === 'Text of encounter note') {
              // Putting all notes in a single array.
              notes.push({
                note: obs.value,
                provider: {
                  name: enc.encounterProviders.length ? enc.encounterProviders[0].provider.person.display : '',
                  role: enc.encounterProviders.length ? enc.encounterProviders[0].encounterRole.display : '',
                },
                time: formatTime(obs.obsDatetime),
              });
            }
          });
        } else {
          enc.obs.forEach((obs: Observation) => {
            if (obs.concept.conceptClass.display === 'Test' || obs.concept.conceptClass.display === 'LabSet')
              tests.push({
                testName: obs.concept.display,
                value: obs.value,
              });
          });
        }
      });
      return [diagnoses, notes, tests, medications];
    }, [encounters]);

  return (
    <div className={styles.summaryContainer}>
      <p className={styles.productiveHeading01}>{t('diagnoses', 'Diagnoses')}</p>
      <div className={`${styles.caption01} ${styles.diagnosesList}`}>
        {diagnoses.length > 0 ? (
          diagnoses.map((d: DiagnosisItem, ind) => (
            <span
              key={ind}
              className={`${styles.diagnosis} ${
                d.order === 'Primary' ? styles.primaryDiagnose : styles.secondaryDiagnose
              }`}>
              {d.diagnosis}
            </span>
          ))
        ) : (
          <span className={`${styles.bodyLong01} ${styles.text02}`} style={{ marginBottom: '0.5rem' }}>
            {t('noDiagnosesFound', 'No diagnoses found')}
          </span>
        )}
      </div>
      <Tabs className={styles.verticalTabs}>
        <Tab
          className={`${styles.tab} ${styles.bodyLong01} ${tabSelected === 0 && styles.selectedTab}`}
          onClick={() => setSelectedTab(0)}
          id="tab-1"
          label={t('notes', 'Notes')}>
          <NotesSummary notes={notes} />
        </Tab>
        <Tab
          className={`${styles.tab} ${tabSelected === 1 && styles.selectedTab}`}
          onClick={() => setSelectedTab(1)}
          id="tab-2"
          label={t('tests', 'Tests')}>
          <TestsSummary tests={tests} />
        </Tab>
        <Tab
          className={`${styles.tab} ${tabSelected === 2 && styles.selectedTab}`}
          onClick={() => setSelectedTab(2)}
          id="tab-3"
          label={t('medications', 'Medications')}>
          <MedicationSummary medications={medications} />
        </Tab>
      </Tabs>
    </div>
  );
};

export default VisitSummary;
