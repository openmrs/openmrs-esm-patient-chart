import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Workspace2, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { type ClinicalFormsWindowProps, type Form } from '@openmrs/esm-patient-common-lib';
import FormsDashboard from './forms-dashboard.component';
import styles from './forms-dashboard-workspace.scss';

/**
 * This workspace lists a table of available forms. When clicking on a row, it launches the form
 * entry workspace (by default, the patient chart's `patient-form-entry-workspace`; other apps pass
 * the name of the one they registered as `formEntryWorkspaceName`).
 *
 * It takes the patient and visit from its window props, not from group props, so it can be used
 * both inside and outside the patient chart.
 */
const FormsDashboardWorkspace: React.FC<Workspace2DefinitionProps<object, ClinicalFormsWindowProps, object>> = ({
  launchChildWorkspace,
  windowProps: { formEntryWorkspaceName = 'patient-form-entry-workspace', patient, patientUuid, visitContext },
}) => {
  const { t } = useTranslation();
  const handleFormOpen = useCallback(
    (form: Form, encounterUuid: string) => {
      launchChildWorkspace(formEntryWorkspaceName, {
        form,
        encounterUuid,
      });
    },
    [launchChildWorkspace, formEntryWorkspaceName],
  );

  return (
    <Workspace2 title={t('clinicalForms', 'Clinical forms')} hasUnsavedChanges={false}>
      <div className={styles.container}>
        <FormsDashboard {...{ patient, visitContext, handleFormOpen }} />
      </div>
    </Workspace2>
  );
};

export default FormsDashboardWorkspace;
