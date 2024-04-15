import React, { useCallback } from 'react';
import styles from './active-visit-buttons.scss';
import { useTranslation } from 'react-i18next';
import { Button, MenuButton, MenuItem } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
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

  const launchAllergiesFormWorkspace = useLaunchWorkspaceRequiringVisit('patient-allergy-form-workspace');
  const launchAppointmentsFormWorkspace = useLaunchWorkspaceRequiringVisit('appointments-form-workspace');
  const launchClinicalFormsWorkspace = useLaunchWorkspaceRequiringVisit('clinical-forms-workspace');
  const launchConditionsFormWorkspace = useLaunchWorkspaceRequiringVisit('conditions-form-workspace');
  const launchOrderBasketFormWorkspace = useLaunchWorkspaceRequiringVisit('order-basket');
  const launchVisitNotesFormWorkspace = useLaunchWorkspaceRequiringVisit('visit-notes-form-workspace');
  const launchVitalsAndBiometricsFormWorkspace = useLaunchWorkspaceRequiringVisit(
    'patient-vitals-biometrics-form-workspace',
  );

  return (
    <div>
      {isTablet || isMobile ? (
        <div className={styles.buttonsContainer}>
          <VisitActionsComponent patientUuid={patientUuid} />

          <MenuButton label={t('more', 'More')} kind="ghost">
            <MenuItem
              kind="ghost"
              label={t('addNote', 'Add note')}
              onClick={launchVisitNotesFormWorkspace}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addLabOrPrescription', 'Add lab or prescription')}
              onClick={launchOrderBasketFormWorkspace}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addVitals', 'Add vitals')}
              onClick={launchVitalsAndBiometricsFormWorkspace}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addCondition', 'Add condition')}
              onClick={launchConditionsFormWorkspace}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addAllergy', 'Add allergy')}
              onClick={launchAllergiesFormWorkspace}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addAppointment', 'Add appointment')}
              onClick={launchAppointmentsFormWorkspace}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('otherForm', 'Other form')}
              onClick={launchClinicalFormsWorkspace}
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
            onClick={launchVisitNotesFormWorkspace}
          >
            {t('addNote', 'Add note')}
          </Button>
          <Button
            kind="ghost"
            renderIcon={(props) => <Add size={16} {...props} />}
            iconDescription="Add lab or prescription"
            onClick={launchOrderBasketFormWorkspace}
          >
            {t('addLabOrPrescription', 'Add lab or prescription')}
          </Button>

          <VisitActionsComponent patientUuid={patientUuid} />

          <MenuButton label={t('more', 'More')} kind="ghost">
            <MenuItem
              kind="ghost"
              label={t('addVitals', 'Add vitals')}
              onClick={launchVitalsAndBiometricsFormWorkspace}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addCondition', 'Add condition')}
              onClick={launchConditionsFormWorkspace}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addAllergy', 'Add allergy')}
              onClick={launchAllergiesFormWorkspace}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addAppointment', 'Add appointment')}
              onClick={launchAppointmentsFormWorkspace}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('otherForm', 'Other form')}
              onClick={launchClinicalFormsWorkspace}
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
