import * as React from "react";
import { Switch, Route, BrowserRouter, useParams } from "react-router-dom";
import { testResultsBasePath } from "./helpers";

export default function withDashboardRouting(WrappedComponent) {
  const WrappedWithParams = (props) => {
    const params = useParams();
    return <WrappedComponent {...props} {...params} />;
  };

  return ({ basePath, patientUuid }) => {
    return (
      <BrowserRouter basename={testResultsBasePath(basePath)}>
        <Switch>
          <Route
            path="/:type?/:panelUuid?/:testUuid?"
            component={(props) => (
              <WrappedWithParams
                {...props}
                patientUuid={patientUuid}
                basePath={basePath}
              />
            )}
          />
        </Switch>
      </BrowserRouter>
    );
  };
}
