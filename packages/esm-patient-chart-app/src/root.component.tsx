import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { dashboardPath, spaRoot, basePath, rdePath } from './constants';
import PatientChart from './patient-chart/patient-chart.component';
import RdePage from './rde/rde-page.component';

export default function Root() {
  return (
    <BrowserRouter basename={spaRoot}>
      <Routes>
        <Route path={basePath} element={<PatientChart />} />
        <Route path={dashboardPath} element={<PatientChart />} />
        <Route path={rdePath} element={<RdePage />} />
      </Routes>
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
 * t('Routine')
 * t('Stat')
 * t('On scheduled date')
 * t('date', 'Date')
 * t('time', 'Time')
 * t('timeFormat', 'Time Format')
 * t('AM', 'AM')
 * t('PM', 'PM')
 * t('now', 'Now')
 * t('inThePast', 'In the past')
 * t('invalidTime', 'Enter a time in hh:mm format')
 * t('encounterBeforeVisitStart', 'The date and time cannot be before the start of the visit')
 * t('encounterAfterVisitEnd', 'The date and time cannot be after the end of the visit')
 * t('encounterInFuture', 'The date and time cannot be in the future')
 * t('clinician', 'Clinician')
 * t('searchForClinician', 'Search for a clinician')
 * t('loadingClinicians', 'Loading clinicians')
 * t('errorLoadingClinicians', 'Error occurred while loading clinicians')
 * t('tryReopeningTheForm', 'Please try launching the form again')
 */
