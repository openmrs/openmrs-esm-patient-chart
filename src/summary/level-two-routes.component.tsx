import React from "react";
import { match, Switch, Route } from "react-router";
import { AllergyCardLevelTwo } from "./history/allergy-card-level-two.component";
import DimensionsCardLevelTwo from "./documentation/dimensions-card-level-two.component";
import VitalsLevelTwo from "./documentation/vital-card-level-two.component";

export function LevelTwoRoutes(props: LevelTwoRoutesProps) {
  return (
    <main className="omrs-main-content">
      <Switch>
        <Route
          exact
          path={`/patient/:patientUuid/chart/allergy`}
          render={routeProps => <AllergyCardLevelTwo match={props.match} />}
        />
        <Route
          exact
          path={`/patient/:patientUuid/chart/dimensions`}
          render={routeProps => <DimensionsCardLevelTwo match={props.match} />}
        />
        <Route
          exact
          path={`/patient/:patientUuid/chart/vitals`}
          render={routeProps => <VitalsLevelTwo match={props.match} />}
        />
      </Switch>
    </main>
  );
}

type LevelTwoRoutesProps = {
  match: match;
};
