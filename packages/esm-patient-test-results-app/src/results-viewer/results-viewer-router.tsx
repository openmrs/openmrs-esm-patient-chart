import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import { testResultsBasePath } from '../helpers';
import RoutedResultsViewer from './results-viewer';

const DashboardRoot = ({ basePath, patientUuid }) => {
  return (
    <BrowserRouter basename={testResultsBasePath(basePath)}>
      <Switch>
        <Route
          path="/:type?/:testUuid?"
          component={(props) => (
            <RoutedResultsViewer {...props} {...props.match.params} patientUuid={patientUuid} basePath={basePath} />
          )}
        />
      </Switch>
    </BrowserRouter>
  );
};

export default DashboardRoot;
