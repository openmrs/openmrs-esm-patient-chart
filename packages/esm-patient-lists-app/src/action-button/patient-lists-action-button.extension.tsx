import React, { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { EventsIcon, ActionMenuButton, launchWorkspace } from '@openmrs/esm-framework';

const handleLaunchPatientListsWorkspace = () => launchWorkspace('patient-lists');

function PatientListsActionButton() {
  const { t } = useTranslation();

  return (
    <ActionMenuButton
      getIcon={(props: ComponentProps<typeof EventsIcon>) => <EventsIcon {...props} />}
      label={t('patientLists', 'Patient lists')}
      iconDescription={t('patientLists', 'Patient lists')}
      handler={handleLaunchPatientListsWorkspace}
      type="patient-lists"
    />
  );
}

export default PatientListsActionButton;
