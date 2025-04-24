import React from 'react';
import { Button , IconButton } from '@carbon/react';
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
   * If true, renders as IconButton instead
   */
  compact?: boolean;
}

const DeleteVisitActionItem: React.FC<DeleteVisitActionItemProps> = ({ patientUuid, visit, compact }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';

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
      {compact ? (
        <IconButton
          onClick={deleteVisit}
          label={getCoreTranslation('delete')}
          kind="danger--ghost"
          size={responsiveSize}
        >
          <TrashCanIcon />
        </IconButton>
      ) : (
        <Button onClick={deleteVisit} kind="danger--ghost" renderIcon={TrashCanIcon} size={responsiveSize}>
          {t('deleteVisit', 'Delete visit')}
        </Button>
      )}
    </UserHasAccess>
  );
};

export default DeleteVisitActionItem;
