import React from 'react';
import { Button } from '@carbon/react';
import { Document } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import { useWorkspaces, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import useLaunchFormsWorkspace from './forms/use-launch-forms-workspace';
import { clinicalFormsWorkspace, formEntryWorkspace } from './constants';
import styles from './clinical-form-action-button.scss';

const ClinicalFormActionButton: React.FC = () => {
  const layout = useLayoutType();
  const { t } = useTranslation();
  const { workspaces } = useWorkspaces();
  const { launchFormsWorkspace } = useLaunchFormsWorkspace();

  const workspaceIndex = workspaces.findIndex(
    (workspace) => workspace.name === clinicalFormsWorkspace || workspace.name === formEntryWorkspace,
  );
  const isActiveWorkspace = workspaceIndex >= 0;

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

  if (layout === 'tablet') {
    return (
      <Button
        kind="ghost"
        className={`${styles.container} ${isActiveWorkspace ? styles.active : ''}`}
        tabIndex={0}
        onClick={launchWorkspace}
      >
        <Document size={16} />
        <span>{t('clinicalForm', 'Clinical form')}</span>
      </Button>
    );
  }

  return (
    <Button
      className={`${styles.container} ${isActiveWorkspace ? styles.active : ''}`}
      kind="ghost"
      renderIcon={(props) => <Document size={20} {...props} />}
      hasIconOnly
      iconDescription={t('form', 'Form')}
      onClick={launchWorkspace}
      enterDelayMs={1000}
      tooltipAlignment="center"
      tooltipPosition="left"
      size="sm"
    />
  );
};

export default ClinicalFormActionButton;
