import { useLaunchWorkspaceRequiringVisit, launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';
import React, { useCallback } from 'react';
import styles from './current-visit-actions.scss';
import { useTranslation } from 'react-i18next';
import { Button, MenuButton, MenuItem } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import type { Visit } from '@openmrs/esm-framework';
import { useLayoutType } from '@openmrs/esm-framework';

export interface CurrentVisitActionsInterface {
  visit: Visit;
}
const CurrentVisitActions: React.FC<CurrentVisitActionsInterface> = ({ visit }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();

  const launchForm = useCallback(
    (workspace) => {
      if (visit) {
        useLaunchWorkspaceRequiringVisit(workspace);
      } else {
        launchStartVisitPrompt();
      }
    },
    [visit],
  );
  return (
    <div>
      {layout === 'tablet' || layout === 'phone' ? (
        <div className={styles.buttonsContainer}>
          <Button
            kind="ghost"
            renderIcon={(props) => <Add size={16} {...props} />}
            iconDescription="Add visit note"
            onClick={() => launchForm('visit-notes-form-workspace')}
          >
            {t('addNote', 'Add note')}
          </Button>
          <MenuButton label={t('more', 'More')} kind="ghost">
            <MenuItem
              kind="ghost"
              label={t('addPrescription', 'Add prescription')}
              onClick={() => launchForm('order-basket')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addOrder', 'Add order')}
              onClick={() => launchForm('order-basket')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addVitals', 'Add vitals')}
              onClick={() => launchForm('patient-vitals-biometrics-form-workspace')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addVitals', 'Add vitals')}
              onClick={() => launchForm('patient-vitals-biometrics-form-workspace')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addCondition', 'Add condition')}
              onClick={() => launchForm('conditions-form-workspace')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addAllergy', 'Add allergy')}
              onClick={() => launchForm('patient-allergy-form-workspace')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addAppointment', 'Add appointment')}
              onClick={() => launchForm('appointments-form-workspace')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('otherForm', 'Other form')}
              onClick={() => launchForm('clinical-forms-workspace')}
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
            onClick={() => launchForm('visit-notes-form-workspace')}
          >
            {t('addNote', 'Add note')}
          </Button>
          <Button
            kind="ghost"
            renderIcon={(props) => <Add size={16} {...props} />}
            iconDescription="Add prescription"
            onClick={() => launchForm('order-basket')}
          >
            {t('addPrescription', 'Add prescription')}
          </Button>
          <Button
            kind="ghost"
            renderIcon={(props) => <Add size={16} {...props} />}
            iconDescription="Add order"
            onClick={() => launchForm('order-basket')}
          >
            {t('addOrder', 'Add order')}
          </Button>

          <MenuButton label={t('more', 'More')} kind="ghost">
            <MenuItem
              kind="ghost"
              label={t('addVitals', 'Add vitals')}
              onClick={() => launchForm('patient-vitals-biometrics-form-workspace')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addCondition', 'Add condition')}
              onClick={() => launchForm('conditions-form-workspace')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addAllergy', 'Add allergy')}
              onClick={() => launchForm('patient-allergy-form-workspace')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('addAppointment', 'Add appointment')}
              onClick={() => launchForm('appointments-form-workspace')}
              renderIcon={Add}
            />
            <MenuItem
              kind="ghost"
              label={t('otherForm', 'Other form')}
              onClick={() => launchForm('clinical-forms-workspace')}
              renderIcon={Add}
            />
          </MenuButton>
        </div>
      )}
    </div>
  );
};

export default CurrentVisitActions;
