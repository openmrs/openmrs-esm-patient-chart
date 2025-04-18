import React from 'react';
import { Button } from '@carbon/react';
import {
  TrashCanIcon,
  UserHasAccess,
  type Visit,
  getCoreTranslation,
  showModal,
  useLayoutType,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

interface DeleteVisitActionItemProps {
  patientUuid: string;
  visit: Visit;

  /**
   * If true, renders the button with fewer words
   */
  compact?: boolean;
}

const DeleteVisitActionItem: React.FC<DeleteVisitActionItemProps> = ({ patientUuid, visit, compact }) => {
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

  const buttonLabel = compact ? getCoreTranslation('delete') : t('deleteVisit', 'Delete visit');

  return (
    <UserHasAccess privilege="Delete Visits">
      <Button onClick={deleteVisit} kind="danger--ghost" renderIcon={TrashCanIcon} size={isTablet ? 'lg' : 'sm'}>
        {buttonLabel}
      </Button>
    </UserHasAccess>
  );
};

export default DeleteVisitActionItem;
