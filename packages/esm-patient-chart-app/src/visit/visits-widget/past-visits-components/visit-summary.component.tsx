import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@carbon/react';
import {
  type Diagnosis,
  DiagnosisTags,
  Extension,
  ExtensionSlot,
  formatTime,
  openmrsFetch,
  parseDate,
  restBaseUrl,
  useAssignedExtensions,
  useConfig,
  type Visit,
} from '@openmrs/esm-framework';
import type { ExternalOverviewProps } from '@openmrs/esm-patient-common-lib';
import classNames from 'classnames';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { type ChartConfig } from '../../../config-schema';
import VisitTimeline from '../single-visit-details/visit-timeline/visit-timeline.component';
import { type Note, type Order, type OrderItem } from '../visit.resource';
import VisitEncountersTable from './encounters-table/visit-encounters-table.component';
import MedicationSummary from './medications-summary.component';
import NotesSummary from './notes-summary.component';
import TestsSummary from './tests-summary.component';
import styles from './visit-summary.scss';

// FIX 1: Added orders, obs, diagnoses, and encounterRole to the heavy representation
const heavyVisitRepresentation =
  'custom:(uuid,display,voided,indication,startDatetime,stopDatetime,' +
  'encounters:(uuid,display,encounterDatetime,' +
  'form:(uuid,name),location:ref,' +
  'encounterType:ref,' +
  'encounterProviders:(uuid,display,encounterRole:(uuid,display),' +
  'provider:(uuid,display,person:(uuid,display))),' +
  'orders:(uuid,action,orderNumber,orderType:(uuid,display),dateActivated,autoExpireDate,concept:(uuid,display),instructions),' +
  'obs:(uuid,display,concept:(uuid,display),obsDatetime,value:ref),' +
  'diagnoses:(uuid,display,rank,certainty,diagnosis:(coded:(uuid,display),nonCoded))),' +
  'patient:(uuid,display),' +
  'visitType:(uuid,name,display),' +
  'attributes:(uuid,display,attributeType:(name,datatypeClassname,uuid),value),' +
  'location:(uuid,name,display))';

interface VisitSummaryProps {
  visit: Visit;
  patientUuid: string;
}

const visitSummaryPanelSlot = 'visit-summary-panels';

const VisitSummary: React.FC<VisitSummaryProps> = ({ visit, patientUuid }) => {
  const config = useConfig<ChartConfig>();
  const { t } = useTranslation();
  const extensions = useAssignedExtensions(visitSummaryPanelSlot);

  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // FIX 2: Included tab index 1 (Notes) in the heavy data trigger
  const needsHeavyData = [1, 2, 3, 4].includes(activeTabIndex);
  const heavyFetchUrl =
    needsHeavyData && visit?.uuid ? `${restBaseUrl}/visit/${visit.uuid}?v=${heavyVisitRepresentation}` : null;

  const { data: heavyVisitResponse } = useSWR<{ data: Visit }>(heavyFetchUrl, openmrsFetch);

  const activeVisit = heavyVisitResponse?.data || visit;

  const [diagnoses, notes, medications]: [Array<Diagnosis>, Array<Note>, Array<OrderItem>] = useMemo(() => {
    const medications: Array<OrderItem> = [];
    const diagnoses: Array<Diagnosis> = [];
    const notes: Array<Note> = [];

    (activeVisit?.encounters || []).forEach((enc) => {
      if (enc?.hasOwnProperty('orders')) {
        medications.push(
          ...(enc?.orders || []).map((order: Order) => ({
            order,
            // FIX 3: Safe optional chaining for providers
            provider: {
              name:
                enc?.encounterProviders?.[0]?.provider?.person?.display ??
                enc?.encounterProviders?.[0]?.provider?.display ??
                '',
              role: enc?.encounterProviders?.[0]?.encounterRole?.display ?? '',
            },
          })),
        );
      }

      if (enc?.hasOwnProperty('diagnoses')) {
        if ((enc?.diagnoses || []).length > 0) {
          const validDiagnoses = (enc?.diagnoses || []).filter((diagnosis) => !diagnosis?.voided);
          diagnoses.push(...validDiagnoses);
        }
      }

      if (enc?.hasOwnProperty('obs')) {
        (enc?.obs || []).forEach((obs) => {
          if (config.notesConceptUuids?.includes(obs?.concept?.uuid)) {
            notes.push({
              note: obs?.value as string,
              // FIX 3: Safe optional chaining for providers
              provider: {
                name:
                  enc?.encounterProviders?.[0]?.provider?.person?.display ??
                  enc?.encounterProviders?.[0]?.provider?.display ??
                  '',
                role: enc?.encounterProviders?.[0]?.encounterRole?.display ?? '',
              },
              time: enc?.encounterDatetime ? formatTime(parseDate(enc.encounterDatetime)) : '',
              concept: obs?.concept,
            });
          }
        });
      }
    });

    diagnoses.sort((a, b) => a.rank - b.rank);
    medications.sort((a, b) => new Date(b.order.dateActivated).getTime() - new Date(a.order.dateActivated).getTime());

    return [diagnoses, notes, medications];
  }, [config.notesConceptUuids, activeVisit?.encounters]);

  const testsFilter = useMemo<ExternalOverviewProps['filter']>(() => {
    const encounterIds = (activeVisit?.encounters || []).map((e) => `Encounter/${e.uuid}`);
    return ([entry]) => {
      return encounterIds.includes(entry?.encounter?.reference);
    };
  }, [activeVisit?.encounters]);

  // FIX 4: Helper variable to accurately check if we have encounters to avoid the `.length` function bug
  const hasEncounters = (activeVisit?.encounters || []).length > 0;

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
        selectedIndex={activeTabIndex}
        onChange={({ selectedIndex }) => {
          setActiveTabIndex(selectedIndex);
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
          {/* FIX 4: Used hasEncounters instead of testsFilter.length */}
          <Tab className={styles.tab} id="tests-tab" disabled={!hasEncounters && config.disableEmptyTabs}>
            {t('tests', 'Tests')}
          </Tab>
          <Tab
            className={styles.tab}
            id="medications-tab"
            disabled={medications.length <= 0 && config.disableEmptyTabs}
          >
            {t('medications', 'Medications')}
          </Tab>
          <Tab className={styles.tab} id="encounters-tab" disabled={!hasEncounters && config.disableEmptyTabs}>
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
            <VisitTimeline visitUuid={visit.uuid} patientUuid={patientUuid} />
          </TabPanel>
          <TabPanel>
            <NotesSummary notes={notes} />
          </TabPanel>
          <TabPanel>
            <TestsSummary patientUuid={patientUuid} encounters={activeVisit?.encounters || []} />
          </TabPanel>
          <TabPanel>
            <MedicationSummary medications={medications} />
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
