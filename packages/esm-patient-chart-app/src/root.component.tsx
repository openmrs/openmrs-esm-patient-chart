import React from 'react';
import { SWRConfig } from 'swr';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
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
        <div className={styles.patientChartWrapper}>
          <VisitHeader />
          <SideMenu />
          <Routes>
            <Route path={basePath} element={<PatientChart />} />
            <Route path={dashboardPath} element={<PatientChart />} />
          </Routes>
          <WorkspaceWindow />
        </div>
      </BrowserRouter>
    </SWRConfig>
  );
}

/**
 * DO NOT REMOVE THIS COMMENT
 * THE TRANSLATION KEYS AND VALUES USED IN THE COMMON LIB IS WRITTEN HERE
 * t('paginationPageText', 'of {{count}} pages', {count})
 * t("emptyStateText", 'There are no {{displayText}} to display for this patient', {displayText: "sample text"})
 * t('record', 'Record')
 * t('errorCopy','Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above.')
 * t('error', 'Error')
 * t('seeAll', 'See all')
 * t('paginationItemsCount', `{{pageItemsCount}} / {{count}} items`, { count: totalItems, pageItemsCount });

 * t('unsavedChangesInOpenedWorkspace', 'You have unsaved changes in the opened workspace. Do you want to discard these changes?')
 * t('unsavedChangesTitleText', 'Unsaved Changes')
 * t('discard','Discard')
 * t('closingAllWorkspacesPromptTitle','You have unsaved changes')
 * t('closingAllWorkspacesPromptBody', 'There are unsaved changes in the following workspaces. Do you want to discard changes in the following workspaces? {{workspaceNames}}')
 * t('closeAllOpenedWorkspaces', 'Discard changes in {{count}} workspaces', {count})
 * t('unsavedChangesInWorkspace', 'There are unsaved changes in {{workspaceName}}. Please save them before opening another workspace.')
 * t('openAnyway', 'Open anyway')
 */
