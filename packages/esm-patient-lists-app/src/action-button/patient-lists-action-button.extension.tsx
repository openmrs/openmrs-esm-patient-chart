import React, { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { EventsIcon, ActionMenuButton2 } from '@openmrs/esm-framework';

function PatientListsActionButton() {
  const { t } = useTranslation();

  return (
    <ActionMenuButton2
      icon={(props: ComponentProps<typeof EventsIcon>) => <EventsIcon {...props} />}
      label={t('patientLists', 'Patient lists')}
      workspaceToLaunch={{
        workspaceName: 'patient-lists',
      }}
    />
  );
}

export default PatientListsActionButton;
