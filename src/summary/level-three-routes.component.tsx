import React from "react";
import { Switch, match, Route } from "react-router";
import { AllergyCardLevelThreeAdd } from "./history/allergy-card-level-three.component";
import style from "./level-three-routes.css";

export function LevelThreeRoutes(props: LevelThreeRoutesProps) {
  return (
    <main className={`omrs-main-content ${style.levelThreeRoutes}`}>
      <Switch>
        <Route
          exact
          path={`/patient/:patientUuid/chart/allergy/add`}
          component={AllergyCardLevelThreeAdd}
        />
      </Switch>
    </main>
  );
}

type LevelThreeRoutesProps = {
  match: match;
};
