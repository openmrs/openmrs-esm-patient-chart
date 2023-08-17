import React from 'react';
import { SWRConfig } from 'swr';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { WorkspaceWindowSizeProvider } from '@openmrs/esm-patient-common-lib';
import { dashboardPath, spaRoot, basePath } from './constants';
import WorkspaceWindow from './workspace/workspace-window.component';
import PatientChart from './patient-chart/patient-chart.component';
import SideMenu from './side-nav/side-menu.component';
import styles from './root.scss';
import VisitHeader from './visit-header/visit-header.component';

const swrConfiguration = {
  // Maximum number of retries when the backend returns an error
  errorRetryCount: 3,
};

export default function Root() {
  return (
    // This SWRConfig very probably does not do anything, because other apps and extensions
    // do not receive this context. If we want to set SWRConfig we would probably need to
    // do in openmrsComponentDecorator in esm-core.
    <SWRConfig value={swrConfiguration}>
      <BrowserRouter basename={spaRoot}>
        <WorkspaceWindowSizeProvider>
          <div className={styles.patientChartWrapper}>
            <VisitHeader />
            <SideMenu />
            <Routes>
              <Route path={basePath} element={<PatientChart />} />
              <Route path={dashboardPath} element={<PatientChart />} />
            </Routes>
            <WorkspaceWindow />
          </div>
        </WorkspaceWindowSizeProvider>
      </BrowserRouter>
    </SWRConfig>
  );
}
