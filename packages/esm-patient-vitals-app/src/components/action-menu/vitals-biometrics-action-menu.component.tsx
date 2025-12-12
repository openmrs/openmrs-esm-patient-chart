import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { launchWorkspace2, showModal, useLayoutType } from '@openmrs/esm-framework';
import { patientVitalsBiometricsFormWorkspace } from '../../constants';
import styles from './vitals-biometrics-action-menu.scss';

interface VitalsAndBiometricsActionMenuProps {
  patient: fhir.Patient;
  encounterUuid: string;
}

export const VitalsAndBiometricsActionMenu = ({ encounterUuid, patient }: VitalsAndBiometricsActionMenuProps) => {
  const { t } = useTranslation();
  const patientUuid = patient.id;
  const isTablet = useLayoutType() === 'tablet';

  const handleLaunchVitalsAndBiometricsForm = useCallback(() => {
    launchWorkspace2(patientVitalsBiometricsFormWorkspace, {
      workspaceTitle: t('editVitalsAndBiometrics', 'Edit Vitals and Biometrics'),
      editEncounterUuid: encounterUuid,
      formContext: 'editing',
    });
  }, [encounterUuid, t]);

  const handleLaunchDeleteVitalsAndBiometricsModal = useCallback(() => {
    const dispose = showModal('vitals-biometrics-delete-confirmation-modal', {
      closeDeleteModal: () => dispose(),
      encounterUuid,
      patientUuid,
    });
  }, [encounterUuid, patientUuid]);

  return (
    <Layer className={styles.layer}>
      <OverflowMenu
        aria-label={t('editOrDeleteVitalsAndBiometrics', 'Edit or delete Vitals and Biometrics')}
        size={isTablet ? 'lg' : 'sm'}
        flipped
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
          id="deleteVitalsAndBiometrics"
          itemText={t('delete', 'Delete')}
          onClick={handleLaunchDeleteVitalsAndBiometricsModal}
          isDelete
          hasDivider
        />
      </OverflowMenu>
    </Layer>
  );
};
