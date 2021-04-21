import * as React from "react";
import { Switch, Route, BrowserRouter, useParams } from "react-router-dom";

export default function withDashboardRouting(WrappedComponent) {
  const WrappedWithParams = (props) => {
    const params = useParams();
    return <WrappedComponent {...props} {...params} />;
  };

  return ({ basePath, patient, patientUuid }) => (
    <BrowserRouter basename={`${window.spaBase}${basePath}/test-results`}>
      <Switch>
        <Route
          path="/:type?/:panelUuid?/:testUuid?"
          component={(props) => (
            <WrappedWithParams
              {...props}
              patientUuid={patientUuid}
              basePath={`${window.spaBase}${basePath}/test-results`}
            />
          )}
        />
      </Switch>
    </BrowserRouter>
  );
}
