import React from 'react';
import { Button, IconButton } from '@carbon/react';
import {
  TrashCanIcon,
  UserHasAccess,
  type Visit,
  getCoreTranslation,
  showModal,
  useLayoutType,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useEncounterPrivileges } from '@openmrs/esm-patient-common-lib';

interface DeleteVisitActionItemProps {
  patientUuid: string;
  visit: Visit;

  /**
   * If true, renders as IconButton instead
   */
  compact?: boolean;
}

const DeleteVisitActionItem: React.FC<DeleteVisitActionItemProps> = ({ visit, compact }) => {
  const { t } = useTranslation();
  const { canEditPastVisits } = useEncounterPrivileges();
  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';

  const deleteVisit = () => {
    const dispose = showModal('delete-visit-dialog', {
      visit,
      closeModal: () => dispose(),
    });
  };

  // Past visits can only be modified by users who may edit past visits
  if (visit?.encounters?.length || (visit?.stopDatetime && !canEditPastVisits)) {
    return null;
  }

  return (
    <UserHasAccess privilege="Delete Visits">
      {compact ? (
        <IconButton
          onClick={deleteVisit}
          label={getCoreTranslation('delete')}
          kind="ghost"
          size={responsiveSize}
          align="top-end"
        >
          <TrashCanIcon size={16} />
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
