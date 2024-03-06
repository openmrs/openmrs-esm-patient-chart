import { launchPatientWorkspace, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import React, { useCallback } from 'react';
import styles from './active-visit-buttons.scss';
import { useTranslation } from 'react-i18next';
import { Button, MenuButton, MenuItem } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import type { Visit } from '@openmrs/esm-framework';
import { showModal, useLayoutType } from '@openmrs/esm-framework';

export interface ActiveVisitActionsInterface {
  visit: Visit;
  patientUuid: string;
}
const ActiveVisitActions: React.FC<ActiveVisitActionsInterface> = ({ visit, patientUuid }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isMobile = layout === 'phone';

  return (
    <div>
      {isTablet || isMobile ? (
        <div className={styles.buttonsContainer}>
          <VisitActionsComponent patientUuid={patientUuid} />

          <MenuButton label={t('more', 'More')} kind="ghost">
            <MenuItem
              kind="ghost"
              label={t('addNote', 'Add note')}
              onClick={useLaunchWorkspaceRequiringVisit('visit-notes-form-workspace')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addLabOrPrescription', 'Add lab or prescription')}
              onClick={useLaunchWorkspaceRequiringVisit('order-basket')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addVitals', 'Add vitals')}
              onClick={useLaunchWorkspaceRequiringVisit('patient-vitals-biometrics-form-workspace')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addCondition', 'Add condition')}
              onClick={useLaunchWorkspaceRequiringVisit('conditions-form-workspace')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addAllergy', 'Add allergy')}
              onClick={useLaunchWorkspaceRequiringVisit('patient-allergy-form-workspace')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addAppointment', 'Add appointment')}
              onClick={useLaunchWorkspaceRequiringVisit('appointments-form-workspace')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('otherForm', 'Other form')}
              onClick={useLaunchWorkspaceRequiringVisit('clinical-forms-workspace')}
              renderIcon={Add}
            />
          </MenuButton>
        </div>
      ) : (
        <div className={styles.buttonsContainer}>
          <Button
            kind="ghost"
            renderIcon={(props) => <Add size={16} {...props} />}
            iconDescription="Add visit note"
            onClick={useLaunchWorkspaceRequiringVisit('visit-notes-form-workspace')}
          >
            {t('addNote', 'Add note')}
          </Button>
          <Button
            kind="ghost"
            renderIcon={(props) => <Add size={16} {...props} />}
            iconDescription="Add lab or prescription"
            onClick={useLaunchWorkspaceRequiringVisit('order-basket')}
          >
            {t('addLabOrPrescription', 'Add lab or prescription')}
          </Button>

          <VisitActionsComponent patientUuid={patientUuid} />

          <MenuButton label={t('more', 'More')} kind="ghost">
            <MenuItem
              kind="ghost"
              label={t('addVitals', 'Add vitals')}
              onClick={useLaunchWorkspaceRequiringVisit('patient-vitals-biometrics-form-workspace')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addCondition', 'Add condition')}
              onClick={useLaunchWorkspaceRequiringVisit('conditions-form-workspace')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addAllergy', 'Add allergy')}
              onClick={useLaunchWorkspaceRequiringVisit('patient-allergy-form-workspace')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addAppointment', 'Add appointment')}
              onClick={useLaunchWorkspaceRequiringVisit('appointments-form-workspace')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('otherForm', 'Other form')}
              onClick={useLaunchWorkspaceRequiringVisit('clinical-forms-workspace')}
              renderIcon={Add}
            />
          </MenuButton>
        </div>
      )}
    </div>
  );
};

export default ActiveVisitActions;

interface VisitActionsProps {
  patientUuid: string;
}
const VisitActionsComponent: React.FC<VisitActionsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();

  const openModal = useCallback(
    (modalName) => {
      const dispose = showModal(modalName, {
        closeModal: () => dispose(),
        patientUuid,
      });
    },
    [patientUuid],
  );

  return (
    <MenuButton label={t('endVisit', 'End visit')} kind="ghost">
      <MenuItem
        kind="ghost"
        label={t('endVisit', 'End visit')}
        onClick={() => openModal('end-visit-dialog')}
        renderIcon={Add}
      />
      <MenuItem
        kind="ghost"
        label={t('cancelVisit', 'Cancel visit')}
        onClick={() => openModal('cancel-visit-dialog')}
        renderIcon={Add}
      />
      <MenuItem
        kind="ghost"
        label={t('deleteVisit', 'Delete visit')}
        onClick={() => openModal('delete-visit-dialog')}
        renderIcon={Add}
      />
    </MenuButton>
  );
};
