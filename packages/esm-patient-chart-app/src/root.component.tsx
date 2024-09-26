import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { dashboardPath, spaRoot, basePath } from './constants';
import PatientChart from './patient-chart/patient-chart.component';
import styles from './root.scss';

export default function Root() {
  return (
    <>
      <div className={styles.patientChartWrapper}>
        <BrowserRouter basename={spaRoot}>
          <Routes>
            <Route path={basePath} element={<PatientChart />} />
            <Route path={dashboardPath} element={<PatientChart />} />
          </Routes>
        </BrowserRouter>
      </div>
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
