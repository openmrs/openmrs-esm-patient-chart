import React from 'react';
import FormsDashboard from './forms-dashboard.component';
import styles from './forms-workspace.scss';

export default function FormsWorkspace() {
  return (
    <div className={styles.container}>
      <FormsDashboard />
    </div>
  );
}
