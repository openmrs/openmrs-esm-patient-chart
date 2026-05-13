import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, TabPanel, TabPanels, Tabs, InlineLoading } from '@carbon/react';
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
import type { Note, Order, OrderItem, LightweightVisit } from '../visit.resource';
import { useFullVisit } from '../visit.resource';
import { dedupeDiagnoses } from '../../dedupe-diagnoses';
import { encounterHasJsonSchemaForm } from './encounters-table/encounters-table.resource';
import MedicationSummary from './medications-summary.component';
import NotesSummary from './notes-summary.component';
import TestsSummary from './tests-summary.component';
import VisitCompletedFormsTable from './encounters-table/visit-completed-forms-table.component';
import VisitEncountersTable from './encounters-table/visit-encounters-table.component';
import VisitTimeline from '../single-visit-details/visit-timeline/visit-timeline.component';
import styles from './visit-summary.scss';

interface VisitSummaryProps {
  visit: Visit | LightweightVisit;
  patientUuid: string;
}

const visitSummaryPanelSlot = 'visit-summary-panels';

const TABS_REQUIRING_FULL_DATA = new Set([
  'timeline-tab',
  'tests-tab',
  'medications-tab',
  'completed-forms-tab',
  'encounters-tab',
]);

/** Defined outside VisitSummary to maintain stable component identity across renders. */
const FullDataLoading: React.FC = () => {
  const { t } = useTranslation();
  return <InlineLoading description={t('loadingVisitDetails', 'Loading visit details...')} />;
};

const VisitSummary: React.FC<VisitSummaryProps> = ({ visit, patientUuid }) => {
  const config = useConfig<ChartConfig>();
  const { t } = useTranslation();
  const extensions = useAssignedExtensions(visitSummaryPanelSlot);

  const [fullDataRequested, setFullDataRequested] = useState(false);

  const { visit: fullVisit, isLoading: isLoadingFullVisit } = useFullVisit(fullDataRequested ? visit.uuid : null);

  const resolvedVisit: Visit | null =
    fullVisit ?? ('encounters' in visit && visit.encounters ? (visit as Visit) : null);

  const diagnoses: Array<Diagnosis> = useMemo(() => {
    if ('diagnoses' in visit && Array.isArray(visit.diagnoses) && visit.diagnoses.length > 0) {
      return dedupeDiagnoses(visit.diagnoses.filter((d) => !d.voided));
    }

    if (resolvedVisit?.encounters) {
      return dedupeDiagnoses(
        resolvedVisit.encounters
          .flatMap((enc) => enc.diagnoses ?? [])
          .filter((d) => !d.voided),
      );
    }

    return [];
  }, [visit, resolvedVisit]);

  const notes: Array<Note> = useMemo(() => {
    if ('notes' in visit && Array.isArray(visit.notes) && visit.notes.length > 0) {
      return visit.notes.map((note) => ({
        note: note.value ?? note.display,
        provider: {
          name: note.provider?.display ?? '',
          role: note.provider?.role ?? '',
        },
        time: note.obsDatetime ? formatTime(parseDate(note.obsDatetime)) : '',
        concept: note.concept ?? { uuid: '', display: '' },
      }));
    }

    if (resolvedVisit?.encounters) {
      const extractedNotes: Array<Note> = [];
      resolvedVisit.encounters.forEach((enc) => {
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
    }

    return [];
  }, [visit, resolvedVisit, config.notesConceptUuids]);

  const medications: Array<OrderItem> = useMemo(() => {
    if (!resolvedVisit?.encounters) return [];

    const meds: Array<OrderItem> = [];
    resolvedVisit.encounters.forEach((enc) => {
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
  }, [resolvedVisit]);

  const encounterIds = useMemo(
    () => resolvedVisit?.encounters?.map((e) => `Encounter/${e.uuid}`) ?? [],
    [resolvedVisit?.encounters],
  );

  const hasCompletedForms = useMemo(
    () => resolvedVisit?.encounters?.some(encounterHasJsonSchemaForm) ?? false,
    [resolvedVisit?.encounters],
  );

  /** Maps selected tab index to tab ID, accounting for dynamic extension tabs. */
  const handleTabChange = (evt: { selectedIndex: number }) => {
    const builtInTabIds = [
      'timeline-tab',
      'notes-tab',
      'tests-tab',
      'medications-tab',
      'completed-forms-tab',
      'encounters-tab',
    ];
    const extensionTabIds = extensions?.map((ext, i) => `${ext.meta.title || i}-tab`) ?? [];
    const allTabIds = [...builtInTabIds, ...extensionTabIds];
    const selectedTabId = allTabIds[evt.selectedIndex];

    if (selectedTabId && TABS_REQUIRING_FULL_DATA.has(selectedTabId) && !fullDataRequested) {
      setFullDataRequested(true);
    }
  };

  /** Renders tab panel content only after full data is requested and loaded. */
  const renderFullDataPanel = (content: React.ReactNode) => {
    if (isLoadingFullVisit) {
      return <FullDataLoading />;
    }
    if (!fullDataRequested) {
      return null;
    }
    return content;
  };

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
      <Tabs onChange={handleTabChange}>
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
            disabled={encounterIds.length === 0 && !fullDataRequested && config.disableEmptyTabs}
          >
            {t('tests', 'Tests')}
          </Tab>
          <Tab
            className={styles.tab}
            id="medications-tab"
            disabled={medications.length <= 0 && !fullDataRequested && config.disableEmptyTabs}
          >
            {t('medications', 'Medications')}
          </Tab>
          <Tab
            className={styles.tab}
            id="completed-forms-tab"
            disabled={!hasCompletedForms && !fullDataRequested && config.disableEmptyTabs}
          >
            {t('completedForms', 'Completed forms')}
          </Tab>
          <Tab
            className={styles.tab}
            id="encounters-tab"
            disabled={!resolvedVisit?.encounters?.length && !fullDataRequested && config.disableEmptyTabs}
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
            {isLoadingFullVisit ? (
              <FullDataLoading />
            ) : (
              <VisitTimeline visitUuid={visit.uuid} patientUuid={patientUuid} />
            )}
          </TabPanel>
          <TabPanel>
            <NotesSummary notes={notes} />
          </TabPanel>
          <TabPanel>
            {renderFullDataPanel(
              resolvedVisit ? <TestsSummary patientUuid={patientUuid} encounters={resolvedVisit.encounters} /> : null,
            )}
          </TabPanel>
          <TabPanel>
            {isLoadingFullVisit ? <FullDataLoading /> : <MedicationSummary medications={medications} />}
          </TabPanel>
          <TabPanel>
            {renderFullDataPanel(
              resolvedVisit ? <VisitCompletedFormsTable visit={resolvedVisit} patientUuid={patientUuid} /> : null,
            )}
          </TabPanel>
          <TabPanel>
            {renderFullDataPanel(
              resolvedVisit ? <VisitEncountersTable visit={resolvedVisit} patientUuid={patientUuid} /> : null,
            )}
          </TabPanel>
          <ExtensionSlot name={visitSummaryPanelSlot}>
            <TabPanel>
              <Extension state={{ patientUuid, visit: resolvedVisit ?? visit }} />
            </TabPanel>
          </ExtensionSlot>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default VisitSummary;
