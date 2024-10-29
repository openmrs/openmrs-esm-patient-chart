import React, { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { EventsIcon, ActionMenuButton } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

const handleLaunchPatientListsWorkspace = () => launchPatientWorkspace('patient-lists');

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
