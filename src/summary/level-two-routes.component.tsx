import React from "react";
import { match, Switch, Route } from "react-router";
import { AllergyCardLevelTwo } from "./history/allergy-card-level-two.component";
import DimensionsCardLevelTwo from "./documentation/dimensions-card-level-two.component";
import VitalsLevelTwo from "./documentation/vital-card-level-two.component";
import ProgramsLevelTwo from "./history/programs/programs-level-two.component";
import ConditionsDetailedSummary from "./history/conditions/conditions-detailedSummary.component";

export function LevelTwoRoutes(props: LevelTwoRoutesProps) {
  return (
    <main className="omrs-main-content">
      <Switch>
        <Route
          exact
          path={`/patient/:patientUuid/chart/allergy`}
          component={AllergyCardLevelTwo}
        />
        <Route
          exact
          path={`/patient/:patientUuid/chart/dimensions`}
          component={DimensionsCardLevelTwo}
        />
        <Route
          exact
          path={`/patient/:patientUuid/chart/vitals`}
          component={VitalsLevelTwo}
        />

        <Route
          exact
          path={`/patient/:patientUuid/chart/programs`}
          component={ProgramsLevelTwo}
        />

        <Route
          exact
          path={`/patient/:patientUuid/chart/conditions`}
          component={ConditionsDetailedSummary}
        />
      </Switch>
    </main>
  );
}

type LevelTwoRoutesProps = {
  match: match;
};
