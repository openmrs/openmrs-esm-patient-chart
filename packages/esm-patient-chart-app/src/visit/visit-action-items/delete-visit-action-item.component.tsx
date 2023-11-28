import React from 'react';
import { Button } from '@carbon/react';
import { UserHasAccess, type Visit, showModal, useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { TrashCan } from '@carbon/react/icons';

interface DeleteVisitActionItemProps {
  patientUuid: string;
  visit: Visit;
}

const DeleteVisitActionItem: React.FC<DeleteVisitActionItemProps> = ({ patientUuid, visit }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const deleteVisit = () => {
    const dispose = showModal('delete-visit-dialog', {
      patientUuid,
      visit,
      closeModal: () => dispose(),
    });
  };

  const cancelVisit = () => {
    const dispose = showModal('cancel-visit-dialog', {
      patientUuid,
      closeModal: () => dispose(),
    });
  };

  const isActiveVisit = !visit?.stopDatetime;

  if (visit?.encounters?.length) {
    return null;
  }

  return (
    <UserHasAccess privilege="Delete Visits">
      <Button
        onClick={isActiveVisit ? cancelVisit : deleteVisit}
        kind="danger--ghost"
        renderIcon={TrashCan}
        size={isTablet ? 'lg' : 'sm'}
      >
        {isActiveVisit ? t('cancelVisit', 'Cancel visit') : t('deleteVisit', 'Delete')}
      </Button>
    </UserHasAccess>
  );
};

export default DeleteVisitActionItem;
