import React from 'react';
import FormsDashboard from './forms-dashboard.component';
import styles from './forms-dashboard-workspace.scss';
import { type DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';

export default function FormsWorkspace(props: DefaultWorkspaceProps) {
  return (
    <div className={styles.container}>
      <FormsDashboard {...props} />
    </div>
  );
}
