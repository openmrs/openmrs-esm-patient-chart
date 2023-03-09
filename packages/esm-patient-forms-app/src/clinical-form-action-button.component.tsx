import React from 'react';
import { Button } from '@carbon/react';
import { Document } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import { useWorkspaces, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import useLaunchFormsWorkspace from './forms/use-launch-forms-workspace';
import styles from './clinical-form-action-button.scss';

const ClinicalFormActionButton: React.FC = () => {
  const layout = useLayoutType();
  const { t } = useTranslation();
  const { workspaces } = useWorkspaces();
  const { launchFormsWorkspace } = useLaunchFormsWorkspace();

  const isActiveWorkspace =
    workspaces?.[0]?.name?.match(/clinical-forms-workspace/i) ||
    workspaces?.[0]?.name?.match(/patient-form-entry-workspace/i);

  const recentlyOpenedForm = workspaces.filter((w) => w.name === 'patient-form-entry-workspace')[0];
  const isFormOpen = workspaces.filter((w) => w.name === 'patient-form-entry-workspace')?.length >= 1;

  if (layout === 'tablet') {
    return (
      <Button
        kind="ghost"
        className={`${styles.container} ${isActiveWorkspace ? styles.active : ''}`}
        tabIndex={0}
        onClick={
          isFormOpen
            ? () =>
                launchPatientWorkspace('patient-form-entry-workspace', {
                  workspaceTitle: recentlyOpenedForm?.additionalProps?.['workspaceTitle'],
                })
            : launchFormsWorkspace
        }
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
      onClick={
        isFormOpen
          ? () =>
              launchPatientWorkspace('patient-form-entry-workspace', {
                workspaceTitle: recentlyOpenedForm?.additionalProps?.['workspaceTitle'],
              })
          : launchFormsWorkspace
      }
      enterDelayMs={1000}
      tooltipAlignment="center"
      tooltipPosition="left"
      size="sm"
    />
  );
};

export default ClinicalFormActionButton;
