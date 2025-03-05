import { type Visit, showSnackbar } from '@openmrs/esm-framework';
import { useMutateVisits } from '@openmrs/esm-patient-common-lib';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteVisit, restoreVisit } from '../visits-widget/visit.resource';

export function useDeleteVisit(patientUuid: string, visit: Visit, onVisitDelete = () => {}, onVisitRestore = () => {}) {
  const { t } = useTranslation();
  const { mutateVisits } = useMutateVisits(patientUuid);
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
        mutateVisits(visit?.uuid);
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
        mutateVisits(visit?.uuid);

        if (!isCurrentVisitDeleted) {
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
