import * as React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import { testResultsBasePath } from '../helpers';
import DesktopView from './desktop-view.component';

const RoutedDesktopView = ({ match, ...props }) => {
  return <DesktopView {...props} {...match.params} />;
};

const DashboardRoot = ({ basePath, patientUuid }) => (
  <BrowserRouter basename={testResultsBasePath(basePath)}>
    <Switch>
      <Route
        path="/:type?/:panelUuid?/:testUuid?"
        component={(props) => <RoutedDesktopView {...props} patientUuid={patientUuid} basePath={basePath} />}
      />
    </Switch>
  </BrowserRouter>
);

export default DashboardRoot;
