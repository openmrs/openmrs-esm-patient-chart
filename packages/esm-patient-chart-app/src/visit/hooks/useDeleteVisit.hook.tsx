import { type Visit, showActionableNotification, showSnackbar, useVisit } from '@openmrs/esm-framework';
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
        showSnackbar({
          title: t('visitRestored', 'Visit restored'),
          subtitle: t('visitRestoredSuccessfully', '{{visit}} restored successfully', {
            visit: visit?.visitType?.display ?? t('visit', 'Visit'),
          }),
          kind: 'success',
        });
        mutateVisits();
        mutateCurrentVisit();
        onVisitRestore?.();
      })
      .catch(() => {
        showSnackbar({
          title: t('visitNotRestored', "Visit couldn't be restored"),
          subtitle: t('errorWhenRestoringVisit', 'Error occured when restoring {{visit}}', {
            visit: visit?.visitType?.display ?? t('visit', 'Visit'),
          }),
          kind: 'error',
        });
      });
  };

  const initiateDeletingVisit = () => {
    setIsDeletingVisit(true);
    const isCurrentVisitDeleted = !visit?.stopDatetime; // True if it's an active visit

    deleteVisit(visit?.uuid)
      .then(() => {
        mutateVisits();
        mutateCurrentVisit();
        // TODO: Needs to be replaced with Actionable Snackbar when Actionable
        if (!isCurrentVisitDeleted) {
          showActionableNotification({
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
        } else {
          showSnackbar({
            title: t('visitCancelled', 'Visit cancelled'),
            subtitle: t('visitCancelSuccessMessage', 'Active {{visit}} cancelled successfully', {
              visit: visit?.visitType?.display ?? t('visit', 'Visit'),
            }),
            isLowContrast: true,
            kind: 'success',
          });
        }
        onVisitDelete?.();
      })
      .catch(() => {
        showSnackbar({
          title: isCurrentVisitDeleted
            ? t('errorCancellingVisit', 'Error cancelling active visit')
            : t('errorDeletingVisit', 'Error deleting visit'),
          kind: 'error',
          subtitle: t('errorOccuredDeletingVisit', 'An error occured when deleting visit'),
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
