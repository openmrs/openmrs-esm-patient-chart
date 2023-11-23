import React from 'react';
import { useTranslation } from 'react-i18next';
import { Events } from '@carbon/react/icons';
import { launchPatientWorkspace, SiderailNavButton } from '@openmrs/esm-patient-common-lib';

const handleLaunchPatientListsWorkspace = () => launchPatientWorkspace('patient-lists');

function PatientListsActionButton() {
  const { t } = useTranslation();

  return (
    <SiderailNavButton
      name={'patient-lists-action-menu'}
      getIcon={(props) => <Events {...props} />}
      label={t('patientLists', 'Patient lists')}
      iconDescription={t('patientLists', 'Patient lists')}
      handler={handleLaunchPatientListsWorkspace}
      type={'patient-list'}
    />
  );
}

export default PatientListsActionButton;
