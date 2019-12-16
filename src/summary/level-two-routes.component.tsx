import React from "react";
import { match, Route } from "react-router";
import { AllergyCardLevelTwo } from "./history/allergy-card-level-two.component";
import DimensionsCardLevelTwo from "./documentation/dimensions-card-level-two.component";
import VitalsLevelTwo from "./documentation/vital-card-level-two.component";
import { Breadcrumbs } from "./breadcrumbs/breadcrumbs.component";
import ProgramsLevelTwo from "./history/programs/programs-level-two.component";
import MedicationsDetailedSummary from "./history/medications/medications-detailedSummary.component";
import { AllergyCreateForm } from "./history/allergy-create-form.component";

const levelTwoRoutes = [
  {
    url: "/patient/:patientUuid/chart/allergy",
    component: AllergyCardLevelTwo
  },
  {
    url: "/patient/:patientUuid/chart/dimensions",
    component: DimensionsCardLevelTwo
  },
  {
    url: "/patient/:patientUuid/chart/vitals",
    component: VitalsLevelTwo
  },
  {
    url: "/patient/:patientUuid/chart/programs",
    component: ProgramsLevelTwo
  },
  {
    url: "/patient/:patientUuid/chart/medications",
    component: MedicationsDetailedSummary
  },
  {
    url: "/patient/:patientUuid/chart/allergy/add",
    component: AllergyCreateForm
  }
];

export function LevelTwoRoutes(props: LevelTwoRoutesProps) {
  return (
    <main className="omrs-main-content" style={{ paddingTop: "2.75rem" }}>
      <Route path="*" render={routeProps => <Breadcrumbs {...routeProps} />} />
      {levelTwoRoutes.map(route => {
        const Component = route.component;
        return (
          <Route exact key={route.url} path={route.url} component={Component} />
        );
      })}
    </main>
  );
}

type LevelTwoRoutesProps = {
  match: match;
};
