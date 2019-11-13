import React from "react";
import { match, Switch, Route } from "react-router";
import { AllergyCardLevelTwo } from "./history/allergy-card-level-two.component";
import { getCurrentPatient } from "@openmrs/esm-api";
import DimensionsCardLevelTwo from "./documentation/dimensions-card-level-two.component";

export function LevelTwoRoutes(props: LevelTwoRoutesProps) {
  const [currentPatient, setCurrentPatient] = React.useState(null);
  React.useEffect(() => {
    const subscription = getCurrentPatient().subscribe(patient => {
      setCurrentPatient(patient);
    });

    return () => subscription.unsubscribe();
  });

  return (
    <main className="omrs-main-content">
      {currentPatient && (
        <Switch>
          <Route
            exact
            path={`/patient/:patientUuid/chart/allergy`}
            render={routeProps => (
              <AllergyCardLevelTwo
                match={props.match}
                currentPatient={currentPatient}
              />
            )}
          />
          <Route
            exact
            path={`/patient/:patientUuid/chart/dimensions`}
            render={routeProps => (
              <DimensionsCardLevelTwo
                match={props.match}
                currentPatient={currentPatient}
              />
            )}
          />
        </Switch>
      )}
    </main>
  );
}

type LevelTwoRoutesProps = {
  match: match;
};
