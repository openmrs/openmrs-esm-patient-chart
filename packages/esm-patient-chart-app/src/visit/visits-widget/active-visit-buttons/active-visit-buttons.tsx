import { launchPatientWorkspace, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import React, { useCallback } from 'react';
import styles from './active-visit-buttons.scss';
import { useTranslation } from 'react-i18next';
import { Button, MenuButton, MenuItem } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import type { Visit } from '@openmrs/esm-framework';
import { showModal, useLayoutType, useConfig } from '@openmrs/esm-framework';

interface ActiveVisitActionsInterface {
  visit: Visit;
  patientUuid: string;
}

interface ActiveVisitProps {
  encounterUuid: string;
  formUuid: string;
  mutateform: any;
  action: 'add' | 'edit';
}

const ActiveVisitActions: React.FC<ActiveVisitActionsInterface & ActiveVisitProps> = ({
  patientUuid,
  mutateform,
  action,
  visit,
}) => {
  const config = useConfig();
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isMobile = layout === 'phone';

  const handleLaunchNotesForm = () => {
    const title = 'Active Visit Note';
    const formName = config.formName.structuredClinicalEncounterForm;

    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: title,
      mutateform: mutateform,
      formInfo: {
        encounterUuid: '',
        formUuid: formName,
        patientUuid: patientUuid,
        visitTypeUuid: '',
        visitUuid: '',
        visitStartDatetime: '',
        visitStopDatetime: '',
        additionalProps: {
          mode: action === 'add',
        },
      },
    });
  };

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
          <VisitActionsComponent patientUuid={patientUuid} visit={visit} />

          <MenuButton label={t('more', 'More')} kind="ghost">
            <MenuItem kind="ghost" label={t('addNote', 'Add note')} onClick={handleLaunchNotesForm} renderIcon={Add} />
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
            onClick={handleLaunchNotesForm}
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

          <VisitActionsComponent patientUuid={patientUuid} visit={visit} />

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
  visit: Visit;
}

const VisitActionsComponent: React.FC<VisitActionsProps> = ({ patientUuid, visit }) => {
  const { t } = useTranslation();

  const openModal = useCallback(
    (modalName) => {
      const dispose = showModal(modalName, {
        closeModal: () => dispose(),
        patientUuid,
        visit,
      });
    },
    [patientUuid, visit],
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
        label={t('deleteVisit', 'Delete Visit')}
        onClick={() => {
          const dispose = showModal('delete-visit-dialog', {
            patientUuid,
            visit,
            closeModal: () => dispose(),
          });
        }}
        renderIcon={Add}
      />
    </MenuButton>
  );
};
