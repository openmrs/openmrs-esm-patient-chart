import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import FormsDashboard from './forms-dashboard.component';
import styles from './forms-dashboard-workspace.scss';
import { type Form } from '@openmrs/esm-patient-common-lib';
import { type Visit, Workspace2, type Workspace2DefinitionProps } from '@openmrs/esm-framework';

export interface ExportedClinicalFormsWindowProps {
  formEntryWorkspaceName: string;
  patient: fhir.Patient;
  patientUuid: string;
  visitContext: Visit;
  mutateVisitContext: () => void;
}

/**
 * This workspace is meant for use outside the patient chart.
 * @see forms-dashboard.workspace.tsx
 */
const ExportedFormsDashboardWorkspace: React.FC<
  Workspace2DefinitionProps<object, ExportedClinicalFormsWindowProps, object>
> = ({ launchChildWorkspace, windowProps: { formEntryWorkspaceName, patient, visitContext } }) => {
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

export default ExportedFormsDashboardWorkspace;
