import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { dashboardPath, spaRoot, basePath } from './constants';
import PatientChart from './patient-chart/patient-chart.component';
import SideMenu from './side-nav/side-menu.component';
import VisitHeader from './visit-header/visit-header.component';
import WorkspaceWindow from './workspace/workspace-window.component';
import styles from './root.scss';

export default function Root() {
  return (
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
 * t('unsavedChangesTitleText', 'Unsaved changes')
 * t('discard','Discard')
 * t('closingAllWorkspacesPromptTitle','You have unsaved changes')
 * t('closingAllWorkspacesPromptBody', 'There are unsaved changes in the following workspaces. Do you want to discard changes in the following workspaces? {{workspaceNames}}')
 * t('closeAllOpenedWorkspaces', 'Discard changes in {{count}} workspaces', {count})
 * t('unsavedChangesInWorkspace', 'There are unsaved changes in {{workspaceName}}. Please save them before opening another workspace.')
 * t('openAnyway', 'Open anyway')
 */
