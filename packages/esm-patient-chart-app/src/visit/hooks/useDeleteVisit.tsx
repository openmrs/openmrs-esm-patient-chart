import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import { type Visit, openmrsFetch, restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import {
  invalidateCurrentVisit,
  invalidateVisitAndEncounterData,
  invalidateVisitByUuid,
  usePatientChartStore,
} from '@openmrs/esm-patient-common-lib';
import { deleteVisit, restoreVisit } from '../visits-widget/visit.resource';

export function useDeleteVisit(activeVisit: Visit, onVisitDelete = () => {}, onVisitRestore = () => {}) {
  const { t } = useTranslation();
  const { mutate: globalMutate } = useSWRConfig();
  const [isDeletingVisit, setIsDeletingVisit] = useState(false);
  const patientUuid = activeVisit?.patient?.uuid || '';
  const { visitContext, setVisitContext } = usePatientChartStore(patientUuid);
  const endedQueueEntryRef = useRef<{
    uuid: string;
    queueUuid: string;
    patient: any;
    priority: any;
    status: any;
    startedAt: string;
  } | null>(null);

  const fetchQueueEntryForVisit = async (visitUuid: string) => {
    try {
      const { data } = await openmrsFetch(`${restBaseUrl}/visit-queue-entry?visit=${visitUuid}`);
      return data?.results?.[0]?.queueEntry ?? null;
    } catch {
      return null;
    }
  };

  const endQueueEntry = async (queueEntryUuid: string) => {
    await openmrsFetch(`${restBaseUrl}/queue-entry/${queueEntryUuid}`, {
      method: 'POST',
      body: JSON.stringify({ endedAt: new Date().toISOString() }),
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const restoreDeletedVisit = () => {
    restoreVisit(activeVisit?.uuid)
      .then(async ({ data: updatedVisit }) => {
        if (!updatedVisit.stopDatetime) {
          const mutateSavedOrUpdatedVisit = () => invalidateVisitByUuid(globalMutate, updatedVisit.uuid);
          setVisitContext(updatedVisit, mutateSavedOrUpdatedVisit);
        }

        // Restore the queue entry if one was ended during deletion
        if (endedQueueEntryRef.current) {
          try {
            await openmrsFetch(`${restBaseUrl}/queue-entry`, {
              method: 'POST',
              body: JSON.stringify({
                queue: { uuid: endedQueueEntryRef.current.queueUuid },
                patient: endedQueueEntryRef.current.patient,
                priority: endedQueueEntryRef.current.priority,
                status: endedQueueEntryRef.current.status,
                startedAt: endedQueueEntryRef.current.startedAt,
              }),
              headers: { 'Content-Type': 'application/json' },
            });
          } catch {
            showSnackbar({
              title: t('queueEntryNotRestored', 'Queue entry not restored'),
              subtitle: t('queueEntryRestoreFailed', 'The patient may not reappear in the queue'),
              kind: 'warning',
            });
          }
          endedQueueEntryRef.current = null;
        }

        invalidateCurrentVisit(globalMutate, patientUuid);
        invalidateVisitAndEncounterData(globalMutate, patientUuid);
        window.dispatchEvent(new CustomEvent('queue-entry-updated'));

        showSnackbar({
          title: t('visitRestored', 'Visit restored'),
          subtitle: t('visitRestoredSuccessfully', '{{visit}} restored successfully', {
            visit: activeVisit?.visitType?.display ?? t('visit', 'Visit'),
          }),
          kind: 'success',
        });
        onVisitRestore?.();
      })
      .catch(() => {
        invalidateCurrentVisit(globalMutate, patientUuid);
        invalidateVisitAndEncounterData(globalMutate, patientUuid);
        showSnackbar({
          title: t('visitNotRestored', "Visit couldn't be restored"),
          subtitle: t('errorWhenRestoringVisit', 'Error occurred when restoring {{visit}}', {
            visit: activeVisit?.visitType?.display ?? t('visit', 'Visit'),
          }),
          kind: 'error',
        });
      });
  };

  const initiateDeletingVisit = async () => {
    setIsDeletingVisit(true);

    try {
      // 1. Fetch queue entry BEFORE voiding the visit
      const queueEntry = await fetchQueueEntryForVisit(activeVisit.uuid);

      // 2. Delete (void) the visit
      await deleteVisit(activeVisit?.uuid);

      if (activeVisit.uuid == visitContext?.uuid) {
        setVisitContext(null, null);
      }

      // 3. End the queue entry (don't void it — preserves history)
      if (queueEntry?.uuid) {
        try {
          // Store queue entry data for potential undo
          endedQueueEntryRef.current = {
            uuid: queueEntry.uuid,
            queueUuid: queueEntry.queue?.uuid,
            patient: queueEntry.patient,
            priority: queueEntry.priority,
            status: queueEntry.status,
            startedAt: queueEntry.startedAt,
          };
          await endQueueEntry(queueEntry.uuid);
        } catch {
          endedQueueEntryRef.current = null;
          showSnackbar({
            title: t('queueEntryNotRemoved', 'Queue entry not removed'),
            subtitle: t('queueEntryRemovalFailed', 'The patient may still appear in the queue'),
            kind: 'warning',
          });
        }
      }

      invalidateCurrentVisit(globalMutate, patientUuid);
      invalidateVisitAndEncounterData(globalMutate, patientUuid);
      window.dispatchEvent(new CustomEvent('queue-entry-updated'));

      showSnackbar({
        title: t('visitDeleted', '{{visit}} deleted', {
          visit: activeVisit?.visitType?.display ?? t('visit', 'Visit'),
        }),
        subtitle: t('visitDeletedSuccessfully', '{{visit}} deleted successfully', {
          visit: activeVisit?.visitType?.display ?? t('visit', 'Visit'),
        }),
        kind: 'success',
        actionButtonLabel: t('undo', 'Undo'),
        onActionButtonClick: restoreDeletedVisit,
      });
      onVisitDelete?.();
    } catch {
      invalidateCurrentVisit(globalMutate, patientUuid);
      invalidateVisitAndEncounterData(globalMutate, patientUuid);

      showSnackbar({
        title: t('errorDeletingVisit', 'Error deleting visit'),
        kind: 'error',
        subtitle: t('errorOccurredDeletingVisit', 'An error occurred when deleting visit'),
      });
    } finally {
      setIsDeletingVisit(false);
    }
  };

  return {
    initiateDeletingVisit,
    isDeletingVisit,
  };
}
