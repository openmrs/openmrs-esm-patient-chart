import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { launchWorkspace2, showModal, useLayoutType } from '@openmrs/esm-framework';
import { type Allergy } from '../types';
import { patientAllergiesFormWorkspace } from '../constants';
import styles from './allergies-action-menu.scss';

interface allergiesActionMenuProps {
  allergy: Allergy;
  patientUuid?: string;
}

export const AllergiesActionMenu = ({ allergy, patientUuid }: allergiesActionMenuProps) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const launchEditAllergiesForm = useCallback(() => {
    launchWorkspace2(patientAllergiesFormWorkspace, {
      allergy,
      formContext: 'editing',
    });
  }, [allergy]);

  const launchDeleteAllergyDialog = (allergyId: string) => {
    const dispose = showModal('delete-allergy-modal', {
      closeDeleteModal: () => dispose(),
      allergyId,
      patientUuid,
    });
  };

  return (
    <Layer className={styles.layer}>
      <OverflowMenu
        aria-label={t('editOrDeleteAllergy', 'Edit or delete allergy')}
        align="left"
        size={isTablet ? 'lg' : 'sm'}
        flipped
      >
        <OverflowMenuItem
          className={styles.menuItem}
          id="editAllergy"
          onClick={launchEditAllergiesForm}
          itemText={t('edit', 'Edit')}
        />
        <OverflowMenuItem
          className={styles.menuItem}
          id="deleteAllergy"
          itemText={t('delete', 'Delete')}
          onClick={() => launchDeleteAllergyDialog(allergy.id)}
          isDelete
          hasDivider
        />
      </OverflowMenu>
    </Layer>
  );
};
