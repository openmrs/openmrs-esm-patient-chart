import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { launchWorkspace } from '@openmrs/esm-framework';
import { showModal, useLayoutType } from '@openmrs/esm-framework';
import { type Allergy } from './allergy-intolerance.resource';
import styles from './allergies-action-menu.scss';
import { patientAllergiesFormWorkspace } from '../constants';

interface allergiesActionMenuProps {
  allergy: Allergy;
  patientUuid?: string;
}

export const AllergiesActionMenu = ({ allergy, patientUuid }: allergiesActionMenuProps) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const launchEditAllergiesForm = useCallback(() => {
    launchWorkspace(patientAllergiesFormWorkspace, {
      workspaceTitle: t('editAllergy', 'Edit an Allergy'),
      allergy,
      formContext: 'editing',
    });
  }, [allergy, t]);

  const launchDeleteAllergyDialog = (allergyId: string) => {
    const dispose = showModal('allergy-delete-confirmation-dialog', {
      closeDeleteModal: () => dispose(),
      allergyId,
      patientUuid,
    });
  };

  return (
    <Layer className={styles.layer}>
      <OverflowMenu
        aria-label={t('editOrDeleteAllergy', 'Edit or delete allergy')}
        size={isTablet ? 'lg' : 'sm'}
        flipped
        align="left"
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
