import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton, DocumentIcon, useWorkspaces } from '@openmrs/esm-framework';
import { launchPatientWorkspace, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import { formEntryWorkspace, htmlFormEntryWorkspace } from './constants';

const ClinicalFormActionButton: React.FC = () => {
  const { t } = useTranslation();
  const { workspaces } = useWorkspaces();
  const launchFormsWorkspace = useLaunchWorkspaceRequiringVisit('clinical-forms-workspace');

  const formEntryWorkspaces = workspaces.filter((w) => w.name === formEntryWorkspace);
  const recentlyOpenedForm = formEntryWorkspaces[0];

  const htmlFormEntryWorkspaces = workspaces.filter((w) => w.name === htmlFormEntryWorkspace);
  const recentlyOpenedHtmlForm = htmlFormEntryWorkspaces[0];

  const isFormOpen = formEntryWorkspaces?.length >= 1;
  const isHtmlFormOpen = htmlFormEntryWorkspaces?.length >= 1;

  const launchPatientWorkspaceCb = () => {
    if (isFormOpen) {
      launchPatientWorkspace(formEntryWorkspace, {
        workspaceTitle: recentlyOpenedForm?.additionalProps?.['workspaceTitle'],
      });
    }
    // we aren't currently supporting keeping HTML Form workspaces open, but just in case
    else if (isHtmlFormOpen) {
      launchPatientWorkspace(htmlFormEntryWorkspace, {
        workspaceTitle: recentlyOpenedHtmlForm?.additionalProps?.['workspaceTitle'],
      });
    } else {
      launchFormsWorkspace();
    }
  };

  return (
    <ActionMenuButton
      getIcon={(props: Partial<Parameters<typeof DocumentIcon>[0]>) => <DocumentIcon {...props} />}
      label={t('clinicalForms', 'Clinical forms')}
      iconDescription={t('clinicalForms', 'Clinical forms')}
      handler={launchPatientWorkspaceCb}
      type={'clinical-form'}
    />
  );
};

export default ClinicalFormActionButton;
