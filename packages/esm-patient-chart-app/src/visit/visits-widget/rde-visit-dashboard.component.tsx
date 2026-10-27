import React, { useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Building } from '@carbon/react/icons';
import { Layer, Tile } from '@carbon/react';
import {
  ExtensionSlot,
  formatDatetime,
  launchWorkspace2,
  parseDate,
  useDebounce,
  type Visit,
} from '@openmrs/esm-framework';
import { EmptyDataIllustration, invalidateVisitAndEncounterData } from '@openmrs/esm-patient-common-lib';
import { useInfiniteVisits } from './visit.resource';
import VisitPickerList from './visit-context/visit-picker.component';
import VisitSummary from './past-visits-components/visit-summary.component';
import { type VisitFormProps, type VisitFormWindowProps } from '../visit-form/visit-form.workspace';
import styles from './rde-visit-dashboard.scss';
import { useSWRConfig } from 'swr';
import { rdeOpenedFrom } from '../../constants';

interface RdeVisitDashboardProps {
  patient: fhir.Patient;
}

/**
 * The Visits tab of the retrospective data entry (RDE) page. A visit picker on the left drives the
 * currently selected visit, whose header and summary are shown in the main panel on the right. The
 * selected visit is held in local state and passed down as a prop, so the header, summary and the
 * "add to visit" slot all act on the visit currently on screen without touching the patient chart
 * store (which is scoped to the chart's own patient and must not be relied on outside it).
 */
const RdeVisitDashboard: React.FC<RdeVisitDashboardProps> = ({ patient }) => {
  const { t } = useTranslation();

  const [maxStartDate, setMaxStartDate] = useState(new Date());
  const maxStartDateDebounced = useDebounce(maxStartDate);

  const patientUuid = patient.id;

  // The default representation includes encounters (with orders, obs and diagnoses), which the visit
  // summary needs. We derive the selected visit from this same list so it never goes stale on refetch.
  const { visits, isLoading, error, hasMore, loadMore, mutate } = useInfiniteVisits(patientUuid, {
    toStartDate: dayjs(maxStartDateDebounced).endOf('day').toISOString(),
  });

  const [selectedVisitUuid, setSelectedVisitUuid] = useState<string>(null);
  const { mutate: globalMutate } = useSWRConfig();

  // Revalidates the picker's own data. We must call this infinite query's own `mutate` (which
  // revalidates under useSWRInfinite's `$inf$` cache key): a global `invalidateVisitAndEncounterData` only
  // refetches the raw page-URL key, which the infinite hook never re-reads, so `visits` wouldn't
  // update. We also invalidate globally so encounter tables outside this list stay in sync.
  const refreshVisits = useCallback(() => {
    mutate();
    invalidateVisitAndEncounterData(globalMutate, patientUuid);
  }, [mutate, globalMutate, patientUuid]);

  // Runs after a visit is created or edited (or an encounter is added to it) in the RDE visit form.
  const handleVisitSaved = (visit: Visit) => {
    // If the saved visit starts after the current "on or prior to" filter, it would be excluded from
    // the list; move the filter to the visit's start date so it shows up in the picker.
    if (dayjs(visit.startDatetime).isAfter(dayjs(maxStartDate).endOf('day'))) {
      setMaxStartDate(new Date(visit.startDatetime));
    }
    setSelectedVisitUuid(visit.uuid);
    refreshVisits();
  };

  const handleVisitDeleted = () => {
    // The delete action lives in the selected visit's header, so clear the panel and refresh the list.
    setSelectedVisitUuid(null);
    refreshVisits();
  };

  const selectedVisit = useMemo(
    () => visits?.find((visit) => visit.uuid === selectedVisitUuid),
    [visits, selectedVisitUuid],
  );

  return (
    <div className={styles.container}>
      <Layer className={styles.pickerColumn}>
        <VisitPickerList
          visits={visits}
          isLoading={isLoading}
          error={error}
          hasMore={hasMore}
          loadMore={loadMore}
          maxStartDate={maxStartDate}
          onChangeMaxStartDate={setMaxStartDate}
          selectedVisitUuid={selectedVisit?.uuid ?? null}
          onSelectVisit={(visit) => setSelectedVisitUuid(visit.uuid)}
          onClickCreateNewVisit={() => {
            launchWorkspace2<VisitFormProps, VisitFormWindowProps, object>(
              'rde-visit-form-workspace',
              { openedFrom: rdeOpenedFrom, onVisitStarted: handleVisitSaved },
              { patient, patientUuid, visitContext: null },
            );
          }}
        />
      </Layer>
      <div className={styles.mainPanel}>
        {selectedVisit ? (
          <VisitMainPanel
            visit={selectedVisit}
            patient={patient}
            onVisitEdited={handleVisitSaved}
            onVisitDeleted={handleVisitDeleted}
            onVisitRestored={refreshVisits}
            onEncounterSaved={refreshVisits}
          />
        ) : (
          <Layer className={styles.emptyStateLayer}>
            <Tile className={styles.emptyStateTile}>
              <EmptyDataIllustration />
              <p className={styles.emptyStateContent}>
                {t('selectVisitToViewDetails', 'Select a visit to view its details')}
              </p>
            </Tile>
          </Layer>
        )}
      </div>
    </div>
  );
};

interface VisitMainPanelProps {
  visit: Visit;
  patient: fhir.Patient;
  onVisitEdited?: (visit: Visit) => void;
  onVisitDeleted?: () => void;
  onVisitRestored?: () => void;
  onEncounterSaved?: () => void;
}

const VisitMainPanel: React.FC<VisitMainPanelProps> = ({
  visit,
  patient,
  onVisitEdited,
  onVisitDeleted,
  onVisitRestored,
  onEncounterSaved,
}) => {
  const { t } = useTranslation();
  const isActive = !visit.stopDatetime;
  const patientUuid = patient.id;

  const dateRange = isActive
    ? formatDatetime(parseDate(visit.startDatetime))
    : t('fromDatetimeToDatetime', '{{fromDatetime}} - {{toDatetime}}', {
        fromDatetime: formatDatetime(parseDate(visit.startDatetime)),
        toDatetime: formatDatetime(parseDate(visit.stopDatetime)),
      });

  return (
    <div className={styles.mainPanelContent}>
      <div className={styles.visitHeader}>
        <div className={styles.visitHeaderInfo}>
          <h4 className={styles.visitType}>{visit.visitType?.display}</h4>
          <div className={styles.visitMeta}>
            <span>{dateRange}</span>
            <span className={styles.separator}>&middot;</span>
            <Building />
            <span className={styles.visitLocation}>{visit.location?.display}</span>
          </div>
        </div>
        <ExtensionSlot
          name="rde-visit-detail-overview-actions"
          className={styles.visitActions}
          state={{
            patientUuid: visit.patient.uuid,
            patient,
            visit,
            compact: true,
            openedFrom: rdeOpenedFrom,
            onVisitEdited,
            onVisitDeleted,
            onVisitRestored,
          }}
        />
      </div>

      <div className={styles.addToVisitBar}>
        <span className={styles.addToVisitLabel}>{t('addToThisVisit', 'Add to this visit')}</span>
        <ExtensionSlot
          name="rde-add-to-visit-slot"
          state={{ patient, patientUuid, visit, mutateVisit: onEncounterSaved }}
        />
      </div>

      <VisitSummary
        visit={visit}
        patient={patient}
        patientUuid={patientUuid}
        onEncounterSaved={onEncounterSaved}
        openedFrom={rdeOpenedFrom}
      />
    </div>
  );
};

export default RdeVisitDashboard;
