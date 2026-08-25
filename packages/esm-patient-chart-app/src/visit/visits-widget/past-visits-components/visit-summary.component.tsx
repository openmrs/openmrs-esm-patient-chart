import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, TabPanel, TabPanels, Tabs, InlineLoading } from '@carbon/react';
import {
  type Diagnosis,
  DiagnosisTags,
  ErrorState,
  Extension,
  ExtensionSlot,
  formatTime,
  parseDate,
  useAssignedExtensions,
  useConfig,
  type Visit,
} from '@openmrs/esm-framework';

import type { ChartConfig } from '../../../config-schema';
import type { Note, Order, OrderItem } from '../visit.resource';
import { useVisitEncounters } from '../visit.resource';
import { encounterHasJsonSchemaForm, type EncountersTableProps } from './encounters-table/encounters-table.resource';

import MedicationSummary from './medications-summary.component';
import NotesSummary from './notes-summary.component';
import TestsSummary from './tests-summary.component';
import VisitCompletedFormsTable from './encounters-table/visit-completed-forms-table.component';
import VisitEncountersTable from './encounters-table/visit-encounters-table.component';
import VisitTimeline from '../single-visit-details/visit-timeline/visit-timeline.component';
import styles from './visit-summary.scss';

interface VisitSummaryProps {
  visit: Visit;
  emrapiDiagnoses?: Array<Diagnosis>;
  patientUuid: string;
  onEditEncounter?: EncountersTableProps['onEditEncounter'];
}

const visitSummaryPanelSlot = 'visit-summary-panels';

/** Defined outside VisitSummary to maintain stable component identity across renders. */
const VisitDetailLoading: React.FC = () => {
  const { t } = useTranslation();
  return <InlineLoading description={t('loadingVisitDetails', 'Loading visit details...')} />;
};

const VisitSummary: React.FC<VisitSummaryProps> = ({ visit, emrapiDiagnoses = [], patientUuid, onEditEncounter }) => {
  const config = useConfig<ChartConfig>();
  const { t } = useTranslation();
  const extensions = useAssignedExtensions(visitSummaryPanelSlot);

  const { encounters, isLoading: isLoadingEncounters, error: encountersError } = useVisitEncounters(patientUuid, visit.uuid);

  const notes: Array<Note> = useMemo(() => {
    if (!encounters) return [];

    const extractedNotes: Array<Note> = [];
    encounters.forEach((enc) => {
      enc.obs?.forEach((obs) => {
        if (config.notesConceptUuids?.includes(obs.concept.uuid)) {
          extractedNotes.push({
            note: obs.value as string,
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
    return extractedNotes;
  }, [encounters, config.notesConceptUuids]);

  const medications: Array<OrderItem> = useMemo(() => {
    if (!encounters) return [];

    const meds: Array<OrderItem> = [];
    encounters.forEach((enc) => {
      if (enc.orders) {
        meds.push(
          ...enc.orders.map((order: Order) => ({
            order,
            provider: {
              name: enc.encounterProviders.length ? enc.encounterProviders[0].provider.person.display : '',
              role: enc.encounterProviders.length ? enc.encounterProviders[0].encounterRole.display : '',
            },
          })),
        );
      }
    });

    meds.sort((a, b) => new Date(b.order.dateActivated).getTime() - new Date(a.order.dateActivated).getTime());
    return meds;
  }, [encounters]);

  const encounterIds = useMemo(() => encounters?.map((e) => `Encounter/${e.uuid}`) ?? [], [encounters]);

  const hasCompletedForms = useMemo(() => encounters?.some(encounterHasJsonSchemaForm) ?? false, [encounters]);

  return (
    <div className={styles.summaryContainer}>
      <p className={styles.diagnosisLabel}>{t('diagnoses', 'Diagnoses')}</p>
      <div className={styles.diagnosesList}>
        {emrapiDiagnoses.length > 0 ? (
          <DiagnosisTags diagnoses={emrapiDiagnoses} />
        ) : (
          <p className={classNames(styles.bodyLong01, styles.text02)} style={{ marginBottom: '0.5rem' }}>
            {t('noDiagnosesFound', 'No diagnoses found')}
          </p>
        )}
      </div>
      <Tabs>
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
          <Tab className={styles.tab} id="tests-tab" disabled={encounterIds.length === 0 && config.disableEmptyTabs}>
            {t('tests', 'Tests')}
          </Tab>
          <Tab
            className={styles.tab}
            id="medications-tab"
            disabled={medications.length <= 0 && config.disableEmptyTabs}
          >
            {t('medications', 'Medications')}
          </Tab>
          <Tab className={styles.tab} id="completed-forms-tab" disabled={!hasCompletedForms && config.disableEmptyTabs}>
            {t('completedForms', 'Completed forms')}
          </Tab>
          <Tab className={styles.tab} id="encounters-tab" disabled={!encounters?.length && config.disableEmptyTabs}>
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
            {isLoadingEncounters ? (
              <VisitDetailLoading />
            ) : encountersError ? (
              <ErrorState error={encountersError} headerTitle={t('encounterError', 'Error loading encounters')} />
            ) : (
              <VisitTimeline
                visit={{ ...visit, encounters: encounters ?? [] }}
                patientUuid={patientUuid}
                onEditEncounter={onEditEncounter}
              />
            )}
          </TabPanel>
          <TabPanel>
            {isLoadingEncounters ? (
              <VisitDetailLoading />
            ) : encountersError ? (
              <ErrorState error={encountersError} headerTitle={t('encounterError', 'Error loading encounters')} />
            ) : (
              <NotesSummary notes={notes} />
            )}
          </TabPanel>
          <TabPanel>
            {isLoadingEncounters ? (
              <VisitDetailLoading />
            ) : encountersError ? (
              <ErrorState error={encountersError} headerTitle={t('encounterError', 'Error loading encounters')} />
            ) : encounters ? (
              <TestsSummary patientUuid={patientUuid} encounters={encounters} />
            ) : null}
          </TabPanel>
          <TabPanel>
            {isLoadingEncounters ? (
              <VisitDetailLoading />
            ) : encountersError ? (
              <ErrorState error={encountersError} headerTitle={t('encounterError', 'Error loading encounters')} />
            ) : (
              <MedicationSummary medications={medications} />
            )}
          </TabPanel>
          <TabPanel>
            {isLoadingEncounters ? (
              <VisitDetailLoading />
            ) : encountersError ? (
              <ErrorState error={encountersError} headerTitle={t('encounterError', 'Error loading encounters')} />
            ) : (
              <VisitCompletedFormsTable
                visit={{ ...visit, encounters: encounters ?? [] }}
                patientUuid={patientUuid}
                onEditEncounter={onEditEncounter}
              />
            )}
          </TabPanel>
          <TabPanel>
            {isLoadingEncounters ? (
              <VisitDetailLoading />
            ) : encountersError ? (
              <ErrorState error={encountersError} headerTitle={t('encounterError', 'Error loading encounters')} />
            ) : (
              <VisitEncountersTable
                visit={{ ...visit, encounters: encounters ?? [] }}
                patientUuid={patientUuid}
                onEditEncounter={onEditEncounter}
              />
            )}
          </TabPanel>
          <ExtensionSlot name={visitSummaryPanelSlot}>
            <TabPanel>
              <Extension state={{ patientUuid, visit: { ...visit, encounters: encounters ?? [] } }} />
            </TabPanel>
          </ExtensionSlot>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default VisitSummary;
