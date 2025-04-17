import React from 'react';
import { Button } from '@carbon/react';
import { TrashCanIcon, UserHasAccess, type Visit, showModal, useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

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

  if (visit?.encounters?.length) {
    return null;
  }

  return (
    <UserHasAccess privilege="Delete Visits">
      <Button onClick={deleteVisit} kind="danger--ghost" renderIcon={TrashCanIcon} size={isTablet ? 'lg' : 'sm'}>
        {t('deleteVisit', 'Delete visit')}
      </Button>
    </UserHasAccess>
  );
};

export default DeleteVisitActionItem;
