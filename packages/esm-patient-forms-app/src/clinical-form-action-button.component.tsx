import React from 'react';
import { Document } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useWorkspaces, launchPatientWorkspace, SiderailNavButton } from '@openmrs/esm-patient-common-lib';
import useLaunchFormsWorkspace from './forms/use-launch-forms-workspace';
import { formEntryWorkspace } from './constants';

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
    <SiderailNavButton
      name={'clinical-form-action-menu'}
      getIcon={(props) => <Document {...props} />}
      label={t('clinicalForms', 'Clinical forms')}
      iconDescription={t('clinicalForms', 'Clinical forms')}
      handler={launchWorkspace}
      type={'clinical-form'}
    />
  );
};

export default ClinicalFormActionButton;
