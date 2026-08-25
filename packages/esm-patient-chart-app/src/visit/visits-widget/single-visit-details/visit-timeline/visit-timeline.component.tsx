import React, { type ComponentProps, useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import { Button, Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExtensionSlot,
  formatDate,
  isDesktop,
  useConfig,
  useFeatureFlag,
  useLayoutType,
  usePagination,
  userHasAccess,
  useSession,
  type Visit,
} from '@openmrs/esm-framework';
import { EmptyState, PatientChartPagination, usePatientChartStore } from '@openmrs/esm-patient-common-lib';
import { type ChartConfig } from '../../../../config-schema';
import {
  canModifyEncounter,
  confirmAndDeleteEncounter,
  editEncounter,
  isVisitNoteEncounter,
} from '../../past-visits-components/encounters-table/encounter-actions';
import {
  downloadPdf,
  encounterHasJsonSchemaForm,
  mapEncounter,
  type EncountersTableProps,
} from '../../past-visits-components/encounters-table/encounters-table.resource';
import EncounterObservations from '../../encounter-observations';
import styles from './visit-timeline.scss';

interface VisitTimelineProps {
  patientUuid: string;
  onEditEncounter?: EncountersTableProps['onEditEncounter'];
  /**
   * Rendered straight from `visit.encounters`, so the visit must be fetched with the fields
   * the visits widget's `customRepresentation` (in `visit.resource.tsx`) asks for. The framework's
   * `defaultVisitCustomRepresentation` is not enough: it omits `obs`, `form.resources`, and
   * `encounterType.editPrivilege`, leaving expanded panels empty and the edit and delete actions
   * offered regardless of privilege.
   */
  visit: Visit;
}

function VisitTimeline({ onEditEncounter, patientUuid, visit }: VisitTimelineProps) {
  const { t } = useTranslation();
  const session = useSession();
  const responsiveSize = isDesktop(useLayoutType()) ? 'sm' : 'lg';
  const { mutate } = useSWRConfig();
  const { mutateVisitContext, patient } = usePatientChartStore(patientUuid);
  const config = useConfig<ChartConfig>();
  const enableEmbeddedFormView = useFeatureFlag('enable-embedded-form-view');
  const canPrintEncounters = userHasAccess('App: Print encounter forms', session?.user);
  const [expandedEncounters, setExpandedEncounters] = useState<Set<string>>(new Set());
  const [isPrinting, setIsPrinting] = useState(false);

  const timelineEntries = useMemo(
    () =>
      [...(visit?.encounters ?? [])]
        .sort((a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime())
        .map((encounter) => {
          const mappedEncounter = mapEncounter(encounter);
          const canDeleteEncounter = canModifyEncounter(mappedEncounter, session?.user, config);
          const hasJsonSchemaForm = encounterHasJsonSchemaForm(encounter);

          return {
            canDeleteEncounter,
            canEditEncounter:
              canDeleteEncounter && Boolean(encounter.form?.uuid || isVisitNoteEncounter(mappedEncounter)),
            canPrintEncounter: canPrintEncounters && hasJsonSchemaForm,
            encounter,
            hasJsonSchemaForm,
            mappedEncounter,
          };
        }),
    [canPrintEncounters, config, session?.user, visit?.encounters],
  );

  // A failed config validator only logs, so a misconfigured page size still reaches us and must not break the widget
  const pageSize = Math.max(1, Math.trunc(config.visitTimelinePageSize));

  const { currentPage, goTo, results: paginatedTimelineEntries } = usePagination(timelineEntries, pageSize);

  // goTo clamps to the last page, so deleting the final encounter of a page can't strand the user on an empty one
  useEffect(() => {
    goTo(currentPage);
  }, [currentPage, goTo]);

  const toggleEncounter = useCallback((encounterUuid: string) => {
    setExpandedEncounters((previouslyExpanded) => {
      const expanded = new Set(previouslyExpanded);
      if (expanded.has(encounterUuid)) {
        expanded.delete(encounterUuid);
      } else {
        expanded.add(encounterUuid);
      }
      return expanded;
    });
  }, []);

  const handleDeleteEncounter = useCallback(
    (encounterUuid: string, encounterTypeName?: string) => {
      confirmAndDeleteEncounter({ encounterUuid, encounterTypeName, patientUuid, t, mutate, mutateVisitContext });
    },
    [mutate, mutateVisitContext, patientUuid, t],
  );

  if (timelineEntries.length === 0) {
    return (
      <EmptyState
        displayText={t('encountersForThisVisit', 'encounters for this visit')}
        headerTitle={t('timeline', 'Timeline')}
      />
    );
  }

  return (
    <div className={styles.visitTimeline}>
      <p className={styles.timelineHeader}>
        <span>{t('encounter', 'Encounter')}</span> <span>&middot;</span>
        <span>{t('provider', 'Provider')}</span> <span>&middot;</span>
        <span>{t('timeStarted', 'Time started')}</span>
      </p>
      <div className={styles.timelineEntries}>
        {paginatedTimelineEntries.map(
          ({
            canDeleteEncounter,
            canEditEncounter,
            canPrintEncounter,
            encounter,
            hasJsonSchemaForm,
            mappedEncounter,
          }) => {
            const isExpanded = expandedEncounters.has(encounter.uuid);

            return (
              <div className={styles.timelineEntryWrapper} key={encounter.uuid}>
                <div className={styles.timelineEntry}>
                  <Button
                    aria-expanded={isExpanded}
                    className={styles.expandButton}
                    hasIconOnly
                    iconDescription={
                      isExpanded
                        ? t('collapseEncounter', 'Collapse encounter')
                        : t('expandEncounter', 'Expand encounter')
                    }
                    kind="ghost"
                    onClick={() => toggleEncounter(encounter.uuid)}
                    renderIcon={(props: ComponentProps<typeof ChevronDownIcon>) =>
                      isExpanded ? <ChevronUpIcon size={16} {...props} /> : <ChevronDownIcon size={16} {...props} />
                    }
                    size={responsiveSize}
                  />
                  <span className={styles.encounterType}>{encounter.encounterType.display}</span>
                  <span>&middot;</span>
                  {!encounter.encounterProviders?.length ? (
                    <span>{t('noProvider', 'No provider')}</span>
                  ) : (
                    <span>
                      {encounter.encounterProviders
                        .map((encounterProvider) => encounterProvider.provider.person.display)
                        .join(', ')}
                    </span>
                  )}
                  <span>&middot;</span>{' '}
                  <span>
                    {formatDate(new Date(encounter.encounterDatetime), {
                      time: dayjs(encounter.encounterDatetime).isSame(dayjs(), 'day') ? 'for today' : true,
                    })}
                  </span>
                  {(canDeleteEncounter || canPrintEncounter) && (
                    <Layer className={styles.layer}>
                      <OverflowMenu
                        align="left"
                        aria-label={t('encounterTableActionsMenu', 'Encounter table actions menu')}
                        flipped
                        size={responsiveSize}
                      >
                        {canEditEncounter && (
                          <OverflowMenuItem
                            className={styles.menuItem}
                            itemText={t('editThisEncounter', 'Edit this encounter')}
                            onClick={() => editEncounter(mappedEncounter, patientUuid, onEditEncounter)}
                          />
                        )}
                        {canPrintEncounter && (
                          <OverflowMenuItem
                            className={styles.menuItem}
                            disabled={isPrinting}
                            itemText={t('printEncounter', 'Print this encounter')}
                            onClick={() => {
                              setIsPrinting(true);
                              downloadPdf([encounter.uuid], t).finally(() => setIsPrinting(false));
                            }}
                          />
                        )}
                        {canDeleteEncounter && (
                          <OverflowMenuItem
                            className={styles.menuItem}
                            hasDivider
                            isDelete
                            itemText={t('deleteThisEncounter', 'Delete this encounter')}
                            onClick={() => handleDeleteEncounter(encounter.uuid, encounter.form?.display)}
                          />
                        )}
                      </OverflowMenu>
                    </Layer>
                  )}
                </div>
                {isExpanded && (
                  <div className={styles.expandedPanel}>
                    {enableEmbeddedFormView && hasJsonSchemaForm ? (
                      <ExtensionSlot
                        name="form-widget-slot"
                        state={{
                          additionalProps: { mode: 'embedded-view' },
                          visitUuid: visit.uuid ?? null,
                          visitTypeUuid: visit.visitType?.uuid ?? null,
                          visitStartDatetime: visit.startDatetime ?? null,
                          visitStopDatetime: visit.stopDatetime ?? null,
                          patientUuid,
                          patient,
                          formUuid: encounter.form.uuid,
                          encounterUuid: encounter.uuid,
                          promptBeforeClosing: () => {},
                        }}
                      />
                    ) : (
                      <>
                        {encounter.form && (
                          <p className={styles.recordedVia}>
                            {t('recordedVia', 'Recorded via {{formName}}', { formName: encounter.form.display })}
                          </p>
                        )}
                        <EncounterObservations observations={encounter.obs} />
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          },
        )}
        <div className={styles.timelineLine} />
      </div>
      <PatientChartPagination
        currentItems={paginatedTimelineEntries.length}
        onPageNumberChange={({ page }) => goTo(page)}
        pageNumber={currentPage}
        pageSize={pageSize}
        totalItems={timelineEntries.length}
      />
    </div>
  );
}

export default VisitTimeline;
