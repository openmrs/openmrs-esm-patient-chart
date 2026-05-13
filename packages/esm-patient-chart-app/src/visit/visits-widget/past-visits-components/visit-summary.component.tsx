import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import {
  type Diagnosis,
  DiagnosisTags,
  Extension,
  ExtensionSlot,
  formatTime,
  parseDate,
  useAssignedExtensions,
  useConfig,
  type Visit,
} from '@openmrs/esm-framework';
import type { ChartConfig } from '../../../config-schema';
import type { ExternalOverviewProps } from '@openmrs/esm-patient-common-lib';
import { customRepresentation, type Note, type Order, type OrderItem } from '../visit.resource';
import { encounterHasJsonSchemaForm } from './encounters-table/encounters-table.resource';
import { useVisitByUuid } from '../../../patient-chart/patient-chart.resources';
import MedicationSummary from './medications-summary.component';
import NotesSummary from './notes-summary.component';
import TestsSummary from './tests-summary.component';
import VisitCompletedFormsTable from './encounters-table/visit-completed-forms-table.component';
import VisitEncountersTable from './encounters-table/visit-encounters-table.component';
import VisitTimeline from '../single-visit-details/visit-timeline/visit-timeline.component';
import styles from './visit-summary.scss';

interface VisitSummaryProps {
  visit: Visit;
  patientUuid: string;
}

const visitSummaryPanelSlot = 'visit-summary-panels';

const VisitSummary: React.FC<VisitSummaryProps> = ({ visit, patientUuid }) => {
  const config = useConfig<ChartConfig>();
  const { t } = useTranslation();
  const extensions = useAssignedExtensions(visitSummaryPanelSlot);
  const [shouldFetchFullVisit, setShouldFetchFullVisit] = useState(false);
  const { visit: fullVisit } = useVisitByUuid(shouldFetchFullVisit ? visit.uuid : null, customRepresentation);

  const activeVisit = fullVisit || visit;

  const [diagnoses, notes, medications]: [Array<Diagnosis>, Array<Note>, Array<OrderItem>] = useMemo(() => {
    // Medication Tab
    const medications: Array<OrderItem> = [];
    // Diagnoses in a Visit
    const diagnoses: Array<Diagnosis> = [];
    // Notes Tab
    const notes: Array<Note> = [];

    if ((activeVisit as any).diagnoses) {
      diagnoses.push(...(activeVisit as any).diagnoses);
    }

    if ((activeVisit as any).visitNotes) {
      (activeVisit as any).visitNotes.forEach((obs) => {
        notes.push({
          note: obs.value as string,
          provider: {
            name: '', // Lightweight API doesn't provide provider for notes directly
            role: '',
          },
          time: obs.obsDatetime ? formatTime(parseDate(obs.obsDatetime)) : '',
          concept: obs.concept,
        });
      });
    }

    activeVisit?.encounters?.forEach((enc) => {
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
          const validDiagnoses = enc.diagnoses.filter((diagnosis) => !diagnosis.voided);
          // Avoid duplicates if we already have diagnoses from the visit object
          validDiagnoses.forEach((diag) => {
            if (!diagnoses.some((d) => d.uuid === diag.uuid)) {
              diagnoses.push(diag as any);
            }
          });
        }
      }

      // Check for Visit Diagnoses and Notes
      if (enc.hasOwnProperty('obs')) {
        enc.obs.forEach((obs) => {
          if (config.notesConceptUuids?.includes(obs.concept.uuid)) {
            const isDuplicate = notes.some(
              (n) => n.note === obs.value && n.time === formatTime(parseDate(enc.encounterDatetime)),
            );
            if (!isDuplicate) {
              notes.push({
                note: obs.value as string,
                provider: {
                  name: enc.encounterProviders.length ? enc.encounterProviders[0].provider.person.display : '',
                  role: enc.encounterProviders.length ? enc.encounterProviders[0].encounterRole.display : '',
                },
                time: enc.encounterDatetime ? formatTime(parseDate(enc.encounterDatetime)) : '',
                concept: obs.concept,
              });
            }
          }
        });
      }
    });

    // Sort the diagnoses by rank, so that primary diagnoses come first
    diagnoses.sort((a, b) => a.rank - b.rank);

    // Sort medications by dateActivated DESC (newest first) to align with backend ordering
    medications.sort((a, b) => new Date(b.order.dateActivated).getTime() - new Date(a.order.dateActivated).getTime());

    return [diagnoses, notes, medications];
  }, [config.notesConceptUuids, activeVisit]);

  const encounterIds = useMemo(
    () => activeVisit?.encounters?.map((e) => `Encounter/${e.uuid}`) ?? [],
    [activeVisit?.encounters],
  );

  const testsFilter = useMemo<ExternalOverviewProps['filter']>(
    () =>
      ([entry]) =>
        encounterIds.includes(entry.encounter?.reference),
    [encounterIds],
  );

  const hasCompletedForms = useMemo(
    () => activeVisit?.encounters?.some(encounterHasJsonSchemaForm) ?? false,
    [activeVisit?.encounters],
  );

  return (
    <div className={styles.summaryContainer}>
      <p className={styles.diagnosisLabel}>{t('diagnoses', 'Diagnoses')}</p>
      <div className={styles.diagnosesList}>
        {diagnoses.length > 0 ? (
          <DiagnosisTags diagnoses={diagnoses} />
        ) : (
          <p className={classNames(styles.bodyLong01, styles.text02)} style={{ marginBottom: '0.5rem' }}>
            {t('noDiagnosesFound', 'No diagnoses found')}
          </p>
        )}
      </div>
      <Tabs
        onChange={({ selectedIndex }) => {
          if (selectedIndex >= 2) {
            setShouldFetchFullVisit(true);
          }
        }}
      >
        <TabList aria-label="Visit summary tabs" className={styles.tablist}>
          <Tab className={classNames(styles.tab, styles.bodyLong01)} id="timeline-tab">
            {t('timeline', 'Timeline')}
          </Tab>
          <Tab
            className={classNames(styles.tab, styles.bodyLong01)}
            id="notes-tab"
            disabled={notes.length <= 0 && config.disableEmptyTabs}
          >
            {t('notes', 'Notes')}
          </Tab>
          <Tab
            className={styles.tab}
            id="tests-tab"
            disabled={shouldFetchFullVisit && encounterIds.length === 0 && config.disableEmptyTabs}
          >
            {t('tests', 'Tests')}
          </Tab>
          <Tab
            className={styles.tab}
            id="medications-tab"
            disabled={shouldFetchFullVisit && medications.length <= 0 && config.disableEmptyTabs}
          >
            {t('medications', 'Medications')}
          </Tab>
          <Tab
            className={styles.tab}
            id="completed-forms-tab"
            disabled={shouldFetchFullVisit && !hasCompletedForms && config.disableEmptyTabs}
          >
            {t('completedForms', 'Completed forms')}
          </Tab>
          <Tab
            className={styles.tab}
            id="encounters-tab"
            disabled={shouldFetchFullVisit && (activeVisit?.encounters?.length ?? 0) <= 0 && config.disableEmptyTabs}
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
            <VisitTimeline visitUuid={activeVisit.uuid} patientUuid={patientUuid} />
          </TabPanel>
          <TabPanel>
            <NotesSummary notes={notes} />
          </TabPanel>
          <TabPanel>
            <TestsSummary patientUuid={patientUuid} encounters={activeVisit?.encounters} />
          </TabPanel>
          <TabPanel>
            <MedicationSummary medications={medications} />
          </TabPanel>
          <TabPanel>
            <VisitCompletedFormsTable visit={activeVisit} patientUuid={patientUuid} />
          </TabPanel>
          <TabPanel>
            <VisitEncountersTable visit={activeVisit} patientUuid={patientUuid} />
          </TabPanel>
          <ExtensionSlot name={visitSummaryPanelSlot}>
            <TabPanel>
              <Extension state={{ patientUuid, visit: activeVisit }} />
            </TabPanel>
          </ExtensionSlot>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default VisitSummary;
