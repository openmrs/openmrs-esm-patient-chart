import * as React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { testResultsBasePath } from '../helpers';
import DesktopView from './desktop-view.component';

const RoutedDesktopView = ({ match, ...props }) => {
  return <DesktopView {...props} {...match.params} />;
};

const DashboardRoot = ({ basePath, patientUuid }) => (
  <BrowserRouter basename={testResultsBasePath(basePath)}>
    <Routes>
      <Route
        path="/:type?/:panelUuid?/:testUuid?"
        element={
          <p>Something to render</p>
          // <RoutedDesktopView patientUuid={patientUuid} basePath={basePath} />
        }
      />
    </Routes>
  </BrowserRouter>
);

export default DashboardRoot;
