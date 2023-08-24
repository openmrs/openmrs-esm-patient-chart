import React from 'react';
import { Document } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useWorkspaces, launchPatientWorkspace, SiderailActionButton } from '@openmrs/esm-patient-common-lib';
import useLaunchFormsWorkspace from './forms/use-launch-forms-workspace';
import { clinicalFormsWorkspace, formEntryWorkspace } from './constants';
const ClinicalFormActionButton: React.FC = () => {
  const { t } = useTranslation();
  const { workspaces } = useWorkspaces();
  const { launchFormsWorkspace } = useLaunchFormsWorkspace();

  const formEntryWorkspaces = workspaces.filter((w) => w.name === formEntryWorkspace);
  const recentlyOpenedForm = formEntryWorkspaces[0];

  const isClinicalFormOpen = formEntryWorkspaces?.length >= 1;

  const launchWorkspace = () => {
    if (isClinicalFormOpen) {
      launchPatientWorkspace('patient-form-entry-workspace', {
        workspaceTitle: recentlyOpenedForm?.additionalProps?.['workspaceTitle'],
      });
    } else {
      launchFormsWorkspace();
    }
  };

  return (
    <SiderailActionButton
      getIcon={(props) => <Document {...props} />}
      label={t('clinicalForm', 'Clinical form')}
      iconDescription={t('form', 'Form')}
      handler={launchWorkspace}
      workspaceMatcher={(name) => name === clinicalFormsWorkspace || name === formEntryWorkspace}
    />
  );
};

export default ClinicalFormActionButton;
