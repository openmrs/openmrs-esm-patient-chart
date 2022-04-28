import React, { useEffect, useMemo } from 'react';
import WorkspaceWindow from './workspace/workspace-window.component';
import PatientChart from './patient-chart/patient-chart.component';
import SideMenu from './side-nav/side-menu.component';
import { BrowserRouter, Route } from 'react-router-dom';
import { dashboardPath, spaRoot, spaBasePath, basePath } from './constants';
import styles from './root.scss';
import { WorkspaceWindowSizeProvider } from '@openmrs/esm-patient-common-lib';
import { SWRConfig } from 'swr';
import { setLeftNav, unsetLeftNav, usePatient } from '@openmrs/esm-framework';

const swrConfiguration = {
  // Maximum number of retries when the backend returns an error
  errorRetryCount: 3,
};

export default function Root() {
  const { patientUuid } = usePatient();
  const leftNavBasePath = useMemo(() => spaBasePath.replace(':patientUuid', patientUuid), [patientUuid]);
  useEffect(() => {
    setLeftNav({ name: 'patient-chart-dashboard-slot', basePath: leftNavBasePath });
    return () => unsetLeftNav('patient-chart-dashboard-slot');
  }, [leftNavBasePath]);

  return (
    <SWRConfig value={swrConfiguration}>
      <BrowserRouter basename={spaRoot}>
        <WorkspaceWindowSizeProvider>
          <div className={styles.patientChartWrapper}>
            <SideMenu />
            <Route path={dashboardPath} component={PatientChart} />
            <Route path={basePath} component={WorkspaceWindow} />
          </div>
        </WorkspaceWindowSizeProvider>
      </BrowserRouter>
    </SWRConfig>
  );
}
