import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import { type Visit, showSnackbar, useVisit } from '@openmrs/esm-framework';
import { invalidateVisitAndEncounterData } from '@openmrs/esm-patient-common-lib';
import { deleteVisit, restoreVisit } from '../visits-widget/visit.resource';

export function useDeleteVisit(visit: Visit, onVisitDelete = () => {}, onVisitRestore = () => {}) {
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();
  const { mutate: mutateCurrentVisit } = useVisit(visit?.patient?.uuid || '');
  const [isDeletingVisit, setIsDeletingVisit] = useState(false);
  const patientUuid = visit?.patient?.uuid || '';

  const restoreDeletedVisit = () => {
    restoreVisit(visit?.uuid)
      .then(() => {
        // Update current visit data for critical components (useVisit hook)
        mutateCurrentVisit();

        // Use targeted SWR invalidation instead of global mutateVisit
        invalidateVisitAndEncounterData(mutate, patientUuid);

        showSnackbar({
          title: t('visitRestored', 'Visit restored'),
          subtitle: t('visitRestoredSuccessfully', '{{visit}} restored successfully', {
            visit: visit?.visitType?.display ?? t('visit', 'Visit'),
          }),
          kind: 'success',
        });
        onVisitRestore?.();
      })
      .catch(() => {
        // On error, revalidate to get correct state
        mutateCurrentVisit();
        invalidateVisitAndEncounterData(mutate, patientUuid);
        showSnackbar({
          title: t('visitNotRestored', "Visit couldn't be restored"),
          subtitle: t('errorWhenRestoringVisit', 'Error occurred when restoring {{visit}}', {
            visit: visit?.visitType?.display ?? t('visit', 'Visit'),
          }),
          kind: 'error',
        });
      });
  };

  const initiateDeletingVisit = () => {
    setIsDeletingVisit(true);

    deleteVisit(visit?.uuid)
      .then(() => {
        // Update current visit data for critical components (useVisit hook)
        mutateCurrentVisit();

        // Use targeted SWR invalidation instead of global mutateVisit
        invalidateVisitAndEncounterData(mutate, patientUuid);

        showSnackbar({
          title: t('visitDeleted', '{{visit}} deleted', {
            visit: visit?.visitType?.display ?? t('visit', 'Visit'),
          }),
          subtitle: t('visitDeletedSuccessfully', '{{visit}} deleted successfully', {
            visit: visit?.visitType?.display ?? t('visit', 'Visit'),
          }),
          kind: 'success',
          actionButtonLabel: t('undo', 'Undo'),
          onActionButtonClick: restoreDeletedVisit,
        });
        onVisitDelete?.();
      })
      .catch(() => {
        // On error, revalidate to get correct state
        mutateCurrentVisit();
        invalidateVisitAndEncounterData(mutate, patientUuid);

        showSnackbar({
          title: t('errorDeletingVisit', 'Error deleting visit'),
          kind: 'error',
          subtitle: t('errorOccurredDeletingVisit', 'An error occurred when deleting visit'),
        });
      })
      .finally(() => {
        setIsDeletingVisit(false);
      });
  };

  return {
    initiateDeletingVisit,
    isDeletingVisit,
  };
}
