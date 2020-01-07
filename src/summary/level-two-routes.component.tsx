import React from "react";
import { match, Route } from "react-router";
import { AllergyCardLevelTwo } from "./history/allergy-card-level-two.component";
import DimensionsCardLevelTwo from "./documentation/dimensions-card-level-two.component";
import VitalsLevelTwo from "./documentation/vital-card-level-two.component";
import { Breadcrumbs } from "./breadcrumbs/breadcrumbs.component";
import ProgramsLevelTwo from "./history/programs/programs-level-two.component";
import MedicationsDetailedSummary from "./history/medications/medications-detailedSummary.component";
import { AllergyCreateForm } from "./history/allergy-create-form.component";

export const levelTwoRoutes = [
  {
    url: "/patient/:patientUuid/chart/allergy",
    component: AllergyCardLevelTwo,
    name: "Allergy"
  },
  {
    url: "/patient/:patientUuid/chart/dimensions",
    component: DimensionsCardLevelTwo,
    name: "Dimensions"
  },
  {
    url: "/patient/:patientUuid/chart/vitals",
    component: VitalsLevelTwo,
    name: "Vitals"
  },
  {
    url: "/patient/:patientUuid/chart/programs",
    component: ProgramsLevelTwo,
    name: "Programs"
  },
  {
    url: "/patient/:patientUuid/chart/medications",
    component: MedicationsDetailedSummary,
    name: "Medications"
  },
  {
    url: "/patient/:patientUuid/chart/allergy/add/",
    component: AllergyCreateForm,
    name: "Add"
  }
];

export default function LevelTwoRoutes(props: LevelTwoRoutesProps) {
  return (
    <div className="omrs-main-content" style={{ paddingTop: "2.75rem" }}>
      <Breadcrumbs />
      {levelTwoRoutes.map(route => {
        const Component = route.component;
        return (
          <Route exact key={route.url} path={route.url} component={Component} />
        );
      })}
    </div>
  );
}

type LevelTwoRoutesProps = {
  match: match;
};
