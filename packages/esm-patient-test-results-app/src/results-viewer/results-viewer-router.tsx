import * as React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import { testResultsBasePath } from '../helpers';
import ResultsViewer from './results-viewer';

const RoutedDesktopView = ({ match, ...props }) => {
  return <ResultsViewer {...props} {...match.params} />;
};

const DashboardRoot = ({ basePath, patientUuid }) => {
  console.log(basePath, patientUuid);
  return (
    <BrowserRouter basename={testResultsBasePath(basePath)}>
      <Switch>
        <Route
          path="/:type?/:testUuid?"
          component={(props) => <RoutedDesktopView {...props} patientUuid={patientUuid} basePath={basePath} />}
        />
      </Switch>
    </BrowserRouter>
  );
};

export default DashboardRoot;
