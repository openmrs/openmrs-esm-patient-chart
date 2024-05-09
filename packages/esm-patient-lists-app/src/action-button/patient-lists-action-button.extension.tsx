import React from 'react';
import { useTranslation } from 'react-i18next';
import { Events } from '@carbon/react/icons';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { ActionMenuButton } from '@openmrs/esm-framework';

const handleLaunchPatientListsWorkspace = () => launchPatientWorkspace('patient-lists');

function PatientListsActionButton() {
  const { t } = useTranslation();

  return (
    <ActionMenuButton
      getIcon={(props) => <Events {...props} />}
      label={t('patientLists', 'Patient lists')}
      iconDescription={t('patientLists', 'Patient lists')}
      handler={handleLaunchPatientListsWorkspace}
      type="patient-lists"
    />
  );
}

export default PatientListsActionButton;
