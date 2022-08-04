import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import RoutedResultsViewer from './results-viewer';

const ResultsView = ({ basePath, patientUuid }) => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<RoutedResultsViewer basePath={basePath} patientUuid={patientUuid} />} />
        <Route path={basePath} element={<RoutedResultsViewer basePath={basePath} patientUuid={patientUuid} />} />
        <Route
          path={`${basePath}/:type/:testUuid`}
          element={<RoutedResultsViewer basePath={basePath} patientUuid={patientUuid} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default ResultsView;
