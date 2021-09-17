import React from 'react';
import ContextWorkspace from './workspace/context-workspace.component';
import PatientChart from './ui-components/patient-chart.component';
import SideMenu from './view-components/side-menu.component';
import { BrowserRouter, Route } from 'react-router-dom';
import { basePath, dashboardPath, spaRoot } from './constants';
import styles from './root.scss';
import { ContextWindowSizeProvider } from './hooks/useContextWindowSize';
import { SWRConfig } from 'swr';

const swrConfiguration = {
  // Maximum number of retries when the backend returns an error
  errorRetryCount: 3,
};

export default function Root() {
  return (
    <SWRConfig value={swrConfiguration}>
      <BrowserRouter basename={spaRoot}>
        <ContextWindowSizeProvider>
          <div className={styles.patientChartWrapper}>
            <SideMenu />
            <Route path={dashboardPath} component={PatientChart} />
            <Route path={basePath} component={ContextWorkspace} />
          </div>
        </ContextWindowSizeProvider>
      </BrowserRouter>
    </SWRConfig>
  );
}
