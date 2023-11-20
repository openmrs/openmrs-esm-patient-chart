import { Visit, showActionableNotification, showNotification, useVisit } from '@openmrs/esm-framework';
import { deleteVisit, restoreVisit, useVisits } from '../visits-widget/visit.resource';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export function useDeleteVisit(patientUuid: string, visit: Visit, onVisitDelete = () => {}, onVisitRestore = () => {}) {
  const { mutateVisits } = useVisits(patientUuid);
  const { mutate: mutateCurrentVisit } = useVisit(patientUuid);
  const [isDeletingVisit, setIsDeletingVisit] = useState(false);
  const { t } = useTranslation();

  const restoreDeletedVisit = () => {
    restoreVisit(visit?.uuid)
      .then(() => {
        showNotification({
          title: t('visitRestored', 'Visit restored'),
          description: t('visitRestoredSuccessfully', '{{visit}} restored successfully', {
            visit: visit?.visitType?.display ?? t('visit', 'Visit'),
          }),
          kind: 'success',
        });
        mutateVisits();
        mutateCurrentVisit();
        onVisitRestore?.();
      })
      .catch(() => {
        showNotification({
          title: t('visitNotRestored', "Visit couldn't be restored"),
          description: t('errorWhenRestoringVisit', 'Error occured when restoring {{visit}}', {
            visit: visit?.visitType?.display ?? t('visit', 'Visit'),
          }),
          kind: 'error',
        });
      });
  };

  const initiateDeletingVisit = () => {
    setIsDeletingVisit(true);
    const isCurrentVisitDeleted = !visit?.stopDatetime;

    deleteVisit(visit?.uuid)
      .then(() => {
        mutateVisits();
        mutateCurrentVisit();
        // TODO: Needs to be replaced with Actionable Snackbar when Actionable
        showActionableNotification({
          title: !isCurrentVisitDeleted
            ? t('visitDeleted', '{{visit}} deleted', {
                visit: visit?.visitType?.display ?? t('visit', 'Visit'),
              })
            : t('visitCancelled', 'Visit cancelled'),
          kind: 'success',
          subtitle: !isCurrentVisitDeleted
            ? t('visitDeletedSuccessfully', '{{visit}} deleted successfully', {
                visit: visit?.visitType?.display ?? t('visit', 'Visit'),
              })
            : t('visitCancelSuccessMessage', 'Active {{visit}} cancelled successfully', {
                visit: visit?.visitType?.display ?? t('visit', 'Visit'),
              }),
          actionButtonLabel: t('undo', 'Undo'),
          onActionButtonClick: restoreDeletedVisit,
        });
        onVisitDelete?.();
      })
      .catch(() => {
        showNotification({
          title: isCurrentVisitDeleted
            ? t('errorCancellingVisit', 'Error cancelling active visit')
            : t('errorDeletingVisit', 'Error deleting visit'),
          kind: 'error',
          description: t('errorOccuredDeletingVisit', 'An error occured when deleting visit'),
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
