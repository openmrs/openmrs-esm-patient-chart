import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import FormsDashboard from './forms-dashboard.component';
import { FormsProvider } from '../hooks/use-forms-context';
import styles from './forms-dashboard-workspace.scss';
import { type Form, type PatientWorkspace2DefinitionProps } from '@openmrs/esm-patient-common-lib';
import { ExtensionSlot, Workspace2 } from '@openmrs/esm-framework';

/**
 * This workspace lists a table of available forms. When clicking on a row, it launches
 * either the form-entry workspace or the html-form-entry workspace.
 *
 * This workspace must only be used within the patient chart.
 * @see exported-forms-dashboard.workspace.tsx
 */
const FormsDashboardWorkspace: React.FC<PatientWorkspace2DefinitionProps<object, object>> = ({
  launchChildWorkspace,
  groupProps: { patient, patientUuid, visitContext },
}) => {
  const { t } = useTranslation();
  const handleFormOpen = useCallback(
    (form: Form, encounterUuid: string) => {
      launchChildWorkspace('patient-form-entry-workspace', {
        form,
        encounterUuid,
      });
    },
    [launchChildWorkspace],
  );

  return (
    <Workspace2 title={t('clinicalForms', 'Clinical forms')} hasUnsavedChanges={false}>
      <FormsProvider>
        <div className={styles.container}>
          <ExtensionSlot name="visit-context-header-slot" state={{ patientUuid }} />
          <FormsDashboard {...{ patient, visitContext, handleFormOpen }} />
        </div>
      </FormsProvider>
    </Workspace2>
  );
};

export default FormsDashboardWorkspace;
