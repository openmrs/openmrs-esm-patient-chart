import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { testResultsBasePath } from '../helpers';
import RoutedResultsViewer from './results-viewer';

const ResultsView = ({ basePath, patientUuid }) => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={`${testResultsBasePath(basePath)}/:type?/:testUuid?`}
          element={
            <p>Something to render</p>
            // <RoutedResultsViewer basePath={basePath} patientUuid={patientUuid} />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default ResultsView;
