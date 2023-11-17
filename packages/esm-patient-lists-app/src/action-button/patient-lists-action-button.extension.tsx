import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Events } from '@carbon/react/icons';
import { SiderailNavButton, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

function PatientListsActionButton() {
  const { t } = useTranslation();

  const handleLaunchPatientListsWorkspace = useCallback(() => launchPatientWorkspace('patient-lists'), []);

  return (
    <SiderailNavButton
      name="patient-lists-action-menu"
      getIcon={(props) => <Events {...props} />}
      label={t('patientLists', 'Patient lists')}
      iconDescription={t('patientLists', 'Patient lists')}
      handler={handleLaunchPatientListsWorkspace}
      type="patient-lists"
    />
  );
}

export default PatientListsActionButton;
