import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { getPatientUuidFromStore } from '@openmrs/esm-patient-common-lib';
import { launchWorkspace, showModal, useLayoutType } from '@openmrs/esm-framework';
import styles from './vitals-biometrics-action-menu.scss';
import { patientVitalsBiometricsFormWorkspace } from '../../constants';

interface VitalsAndBiometricsActionMenuProps {
  encounterUuid: string;
  formType: 'vitals' | 'biometrics';
}

export const VitalsAndBiometricsActionMenu = ({ encounterUuid, formType }: VitalsAndBiometricsActionMenuProps) => {
  const { t } = useTranslation();
  const patientUuid = getPatientUuidFromStore();
  const isTablet = useLayoutType() === 'tablet';

  const handleLaunchVitalsAndBiometricsForm = useCallback(() => {
    launchWorkspace(patientVitalsBiometricsFormWorkspace, {
      workspaceTitle: t('editVitalsAndBiometrics', 'Edit Vitals and Biometrics'),
      editEncounterUuid: encounterUuid,
      formContext: 'editing',
    });
  }, [encounterUuid, t]);

  const handleLaunchDeleteVitalsAndBiometricsModal = () => {
    const dispose = showModal('vitals-biometrics-delete-confirmation-modal', {
      closeDeleteModal: () => dispose(),
      encounterUuid,
      formType,
      patientUuid,
    });
  };

  return (
    <Layer className={styles.layer}>
      <OverflowMenu
        aria-label={t('editOrDeleteVitalsAndBiometrics', 'Edit or delete Vitals and Biometrics')}
        size={isTablet ? 'lg' : 'sm'}
        flipped
        align="left"
        id={encounterUuid}
      >
        <OverflowMenuItem
          className={styles.menuItem}
          id="editVitalsAndBiometrics"
          onClick={handleLaunchVitalsAndBiometricsForm}
          itemText={t('edit', 'Edit')}
        />
        <OverflowMenuItem
          className={styles.menuItem}
          id="deleteViitalsAndBiometrics"
          itemText={t('delete', 'Delete')}
          onClick={handleLaunchDeleteVitalsAndBiometricsModal}
          isDelete
          hasDivider
        />
      </OverflowMenu>
    </Layer>
  );
};
