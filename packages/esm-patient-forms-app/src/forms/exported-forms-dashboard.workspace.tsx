import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import FormsDashboard from './forms-dashboard.component';
import styles from './forms-dashboard-workspace.scss';
import { hasPatientBannerData, type Form, usePatientForBanner } from '@openmrs/esm-patient-common-lib';
import { ExtensionSlot, type Visit, Workspace2, type Workspace2DefinitionProps } from '@openmrs/esm-framework';

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
> = ({
  launchChildWorkspace,
  windowProps: { formEntryWorkspaceName, patient: patientProp, patientUuid, visitContext },
}) => {
  const { t } = useTranslation();
  const patient = usePatientForBanner(patientProp, patientUuid) ?? patientProp;
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
      {hasPatientBannerData(patient) && patientUuid && (
        <ExtensionSlot name="patient-header-slot" state={{ patient, patientUuid, hideActionsOverflow: true }} />
      )}
      <div className={styles.container}>
        <FormsDashboard {...{ patient, visitContext, handleFormOpen }} />
      </div>
    </Workspace2>
  );
};

export default ExportedFormsDashboardWorkspace;
