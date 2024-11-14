import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import RoutedResultsViewer from './results-viewer.extension';

const ResultsView = ({ basePath, patientUuid }) => {
  return (
    <BrowserRouter
      basename={`${window['getOpenmrsSpaBase']()}patient/${patientUuid}/chart/${encodeURIComponent(basePath)}`}
    >
      <Routes>
        <Route path="" element={<RoutedResultsViewer basePath={basePath} patientUuid={patientUuid} />} />
        <Route path=":type/:testUuid" element={<RoutedResultsViewer basePath={basePath} patientUuid={patientUuid} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default ResultsView;
