import React from 'react';
import { Button } from '@carbon/react';
import { UserHasAccess, Visit, showModal, useLayoutType } from '@openmrs/esm-framework';
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

  if (visit?.stopDatetime || visit?.encounters?.length) {
    return null;
  }

  return (
    <UserHasAccess privilege="Delete Visits">
      <Button onClick={deleteVisit} kind="danger--ghost" renderIcon={TrashCan} size={isTablet ? 'lg' : 'sm'}>
        {t('deleteVisit', 'Delete')}
      </Button>
    </UserHasAccess>
  );
};

export default DeleteVisitActionItem;
