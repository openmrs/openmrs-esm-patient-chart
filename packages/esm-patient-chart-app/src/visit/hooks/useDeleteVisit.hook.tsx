import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Visit, showSnackbar, useVisit } from '@openmrs/esm-framework';
import { deleteVisit, restoreVisit, useInfiniteVisits } from '../visits-widget/visit.resource';

export function useDeleteVisit(patientUuid: string, visit: Visit, onVisitDelete = () => {}, onVisitRestore = () => {}) {
  const { t } = useTranslation();
  const { mutate: mutateCurrentVisit } = useVisit(patientUuid);
  const { mutate: mutateInfiniteVisits } = useInfiniteVisits(patientUuid);
  const [isDeletingVisit, setIsDeletingVisit] = useState(false);

  const restoreDeletedVisit = () => {
    restoreVisit(visit?.uuid)
      .then(() => {
        showSnackbar({
          title: t('visitRestored', 'Visit restored'),
          subtitle: t('visitRestoredSuccessfully', '{{visit}} restored successfully', {
            visit: visit?.visitType?.display ?? t('visit', 'Visit'),
          }),
          kind: 'success',
        });
        mutateCurrentVisit();
        mutateInfiniteVisits();
        onVisitRestore?.();
      })
      .catch(() => {
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
        mutateCurrentVisit();
        mutateInfiniteVisits();

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
