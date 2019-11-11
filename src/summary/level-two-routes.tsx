import React from "react";
import { match, Switch, Route, useRouteMatch } from "react-router";
import { AllergyCardLevelTwo } from "./history/allergy-card-level-two.component";

export function LevelTwoRoutes(props: LevelTwoRoutesProps) {
  let { path } = useRouteMatch();

  return (
    <div>
      <Switch>
        <Route exact path={`${path}/allergy`}>
          <AllergyCardLevelTwo
            match={props.match}
            currentPatient={props.patient}
          />
        </Route>
      </Switch>
    </div>
  );
}

type LevelTwoRoutesProps = {
  match: match;
  patient: fhir.Patient;
};
