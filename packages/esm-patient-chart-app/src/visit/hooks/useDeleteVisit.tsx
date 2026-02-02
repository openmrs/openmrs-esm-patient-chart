import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import { type Visit, showSnackbar } from '@openmrs/esm-framework';
import {
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

  const restoreDeletedVisit = () => {
    restoreVisit(activeVisit?.uuid)
      .then(({ data: updatedVisit }) => {
        if (!updatedVisit.stopDatetime) {
          const mutateSavedOrUpdatedVisit = () => invalidateVisitByUuid(globalMutate, updatedVisit.uuid);
          setVisitContext(updatedVisit, mutateSavedOrUpdatedVisit);
        }

        // Use targeted SWR invalidation instead of global mutateVisit
        invalidateVisitAndEncounterData(globalMutate, patientUuid);

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
        // On error, revalidate to get correct state
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

  const initiateDeletingVisit = () => {
    setIsDeletingVisit(true);

    deleteVisit(activeVisit?.uuid)
      .then(() => {
        if (activeVisit.uuid == visitContext?.uuid) {
          setVisitContext(null, null);
        }

        // Use targeted SWR invalidation instead of global mutateVisit
        invalidateVisitAndEncounterData(globalMutate, patientUuid);

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
      })
      .catch(() => {
        // On error, revalidate to get correct state
        invalidateVisitAndEncounterData(globalMutate, patientUuid);

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
