import React from 'react';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import { dashboardPath, spaRoot, basePath } from './constants';
import PatientChart from './patient-chart/patient-chart.component';
import SideMenu from './side-nav/side-menu.component';
import VisitHeader from './visit-header/visit-header.component';
import styles from './root.scss';
import { WorkspaceWindow } from '@openmrs/esm-framework';

export default function Root() {
  const { patientUuid } = useParams();
  return (
    <>
      <BrowserRouter basename={spaRoot}>
        <div className={styles.patientChartWrapper}>
          <VisitHeader />
          <SideMenu />
          <Routes>
            <Route path={basePath} element={<PatientChart />} />
            <Route path={dashboardPath} element={<PatientChart />} />
          </Routes>
        </div>
      </BrowserRouter>
      <WorkspaceWindow contextKey={`patient/${patientUuid}`} />
    </>
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
 */
