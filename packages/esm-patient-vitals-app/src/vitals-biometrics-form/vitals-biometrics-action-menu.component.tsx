import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem, OverflowMenu, Layer } from '@carbon/react';
import { showModal, useLayoutType, usePatient } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { patientVitalsBiometricsFormWorkspace } from '../constants';
import { useVitalsAndBiometrics } from '../common';
import styles from './vitals-biometrics-action-menu.scss';

interface VitalsActionMenuProps {
  formType: 'vitals' | 'biometrics';
  rowId: string;
}

export const VitalsAndBiometricsActionMenu = ({ formType, rowId }: VitalsActionMenuProps) => {
  const { patientUuid } = usePatient();
  const { data: vitalsBiometrics } = useVitalsAndBiometrics(patientUuid, 'both');
  const encounterUuid = vitalsBiometrics?.[rowId]?.uuid;
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const launchEditVitalForm = useCallback(() => {
    launchPatientWorkspace(patientVitalsBiometricsFormWorkspace, {
      workSpaceTitle: t('editVitalsAndBiometrics', 'Edit Vitals and Biometrics'),
      vitalsBiometrics,
      encounterUuid,
      formContext: 'editing',
      formType,
    });
  }, [t, vitalsBiometrics, encounterUuid, formType]);

  const launchDeleteVitalForm = () => {
    const dispose = showModal('vitals-and-biometrics-delete-modal', {
      closeDeleteModal: () => dispose(),
      patientUuid,
      encounterUuid,
    });
  };

  return (
    <Layer className={styles.layer}>
      <OverflowMenu arial-label={t('optionsMenu', 'Options menu')} size={isTablet ? 'lg' : 'sm'} flipped align="left">
        <OverflowMenuItem
          id="editVitalsAndBiometrics"
          className={styles.menuItem}
          onClick={launchEditVitalForm}
          itemText={t('edit', 'Edit')}
        />
        <OverflowMenuItem
          id="deleteVitalsAndBiometrics"
          className={styles.menuItem}
          onClick={launchDeleteVitalForm}
          itemText={t('delete', 'Delete')}
          hasDivider
          isDelete
        />
      </OverflowMenu>
    </Layer>
  );
};
