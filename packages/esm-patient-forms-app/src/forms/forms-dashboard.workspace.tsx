import React from 'react';
import FormsDashboard from './forms-dashboard.component';
import styles from './forms-dashboard-workspace.scss';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { ExtensionSlot, useFeatureFlag } from '@openmrs/esm-framework';

export default function FormsWorkspace(props: DefaultPatientWorkspaceProps) {
  const { patientUuid } = props;

  return (
    <div className={styles.container}>
      <ExtensionSlot name="visit-context-header-slot" state={{ patientUuid }} />
      <FormsDashboard {...props} />
    </div>
  );
}
