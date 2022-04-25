import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import { testResultsBasePath } from '../helpers';
import RoutedResultsViewer from './results-viewer';

const ResultsView = ({ basePath, patientUuid }) => {
  return (
    <BrowserRouter>
      <Switch>
        <Route
          path={`${testResultsBasePath(basePath)}/:type?/:testUuid?`}
          component={(props) => (
            <RoutedResultsViewer {...props} {...props.match.params} patientUuid={patientUuid} basePath={basePath} />
          )}
        />
      </Switch>
    </BrowserRouter>
  );
};

export default ResultsView;
