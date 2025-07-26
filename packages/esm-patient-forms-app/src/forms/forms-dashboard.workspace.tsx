import React from 'react';
import { useTranslation } from 'react-i18next';
import FormsDashboard from './forms-dashboard.component';
import styles from './forms-dashboard-workspace.scss';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { ExtensionSlot, Workspace2 } from '@openmrs/esm-framework';

export default function FormsWorkspace(props: DefaultPatientWorkspaceProps) {
  const { patientUuid } = props;
  const { t } = useTranslation();

  return (
    <Workspace2 title={t('clinicalForms', 'Clinical forms')} hasUnsavedChanges={false}>
      <div className={styles.container}>
        <ExtensionSlot name="visit-context-header-slot" state={{ patientUuid }} />
        <FormsDashboard {...props} />
      </div>
    </Workspace2>
  );
}
