import React from 'react';
import { useTranslation } from 'react-i18next';
import FormsDashboard from './forms-dashboard.component';
import styles from './forms-dashboard-workspace.scss';
import {
  type ClinicalFormsWorkspaceWindowProps,
  type PatientWorkspace2DefinitionProps,
} from '@openmrs/esm-patient-common-lib';
import { ExtensionSlot, Workspace2 } from '@openmrs/esm-framework';

/**
 * This workspace lists a table of available forms. When clicking on a row, it launches
 * either the form-entry workspace or the html-form-entry workspace
 */
export default function FormsWorkspace(props: PatientWorkspace2DefinitionProps<{}, ClinicalFormsWorkspaceWindowProps>) {
  const { t } = useTranslation();

  return (
    <Workspace2 title={t('clinicalForms', 'Clinical forms')} hasUnsavedChanges={false}>
      <div className={styles.container}>
        <ExtensionSlot name="visit-context-header-slot" state={{ patientUuid: props.groupProps.patientUuid }} />
        <FormsDashboard {...props} />
      </div>
    </Workspace2>
  );
}
