import React, { useEffect, useMemo } from 'react';
import { SWRConfig } from 'swr';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { WorkspaceWindowSizeProvider } from '@openmrs/esm-patient-common-lib';
import { setLeftNav, unsetLeftNav, usePatient } from '@openmrs/esm-framework';
import { dashboardPath, spaRoot, spaBasePath, basePath } from './constants';
import WorkspaceWindow from './workspace/workspace-window.component';
import PatientChart from './patient-chart/patient-chart.component';
import SideMenu from './side-nav/side-menu.component';
import styles from './root.scss';

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
            <Routes>
              <Route path={basePath} element={<PatientChart />} />
              <Route path={dashboardPath} element={<PatientChart />} />
            </Routes>
            <WorkspaceWindow patientUuid={patientUuid} />
          </div>
        </WorkspaceWindowSizeProvider>
      </BrowserRouter>
    </SWRConfig>
  );
}
