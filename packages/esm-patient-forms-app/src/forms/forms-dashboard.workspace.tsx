import React from 'react';
import FormsDashboard from './forms-dashboard.component';
import styles from './forms-dashboard-workspace.scss';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';

export default function FormsWorkspace(props: DefaultPatientWorkspaceProps) {
  return (
    <div className={styles.container}>
      <FormsDashboard {...props} />
    </div>
  );
}
