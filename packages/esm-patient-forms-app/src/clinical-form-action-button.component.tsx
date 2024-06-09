import React from 'react';
import { Document } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { launchPatientWorkspace, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import { formEntryWorkspace } from './constants';
import { ActionMenuButton, useWorkspaces } from '@openmrs/esm-framework';

const ClinicalFormActionButton: React.FC = () => {
  const { t } = useTranslation();
  const { workspaces } = useWorkspaces();
  const launchFormsWorkspace = useLaunchWorkspaceRequiringVisit('clinical-forms-workspace');

  const formEntryWorkspaces = workspaces.filter((w) => w.name === formEntryWorkspace);
  const recentlyOpenedForm = formEntryWorkspaces[0];

  const isClinicalFormOpen = formEntryWorkspaces?.length >= 1;

  const launchPatientWorkspaceCb = () => {
    if (isClinicalFormOpen) {
      launchPatientWorkspace('patient-form-entry-workspace', {
        workspaceTitle: recentlyOpenedForm?.additionalProps?.['workspaceTitle'],
      });
    } else {
      launchFormsWorkspace();
    }
  };

  return (
    <ActionMenuButton
      getIcon={(props) => <Document {...props} />}
      label={t('clinicalForms', 'Clinical forms')}
      iconDescription={t('clinicalForms', 'Clinical forms')}
      handler={launchPatientWorkspaceCb}
      type={'clinical-form'}
    />
  );
};

export default ClinicalFormActionButton;
