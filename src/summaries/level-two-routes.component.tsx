import React, { FunctionComponent } from "react";
import { match, Route } from "react-router";
import { AllergyOverviewLevelTwo } from "../widgets/allergies/allergy-card-level-two.component";
import HeightAndWeightDetailed from "../widgets/heightandweight/heightandweight-detailed.component";
import VitalsDetailedSummary from "../widgets/vitals/vitals-detailed-summary.component";
import { Breadcrumbs } from "../breadcrumbs/breadcrumbs.component";
import ProgramsLevelTwo from "../widgets/programs/programs-level-two.component";
import { AllergyForm } from "../widgets/allergies/allergy-form.component";
import { VitalsForm } from "../widgets/vitals/vitals-form.component";
import ConditionsBriefSummary from "../widgets/conditions/conditions-brief-summary.component";
import MedicationLevelTwo from "../widgets/medications/medication-level-two.component";
import { AllergyCardLevelThree } from "../widgets/allergies/allergy-card-level-three.component";

export const levelTwoRoutes: PatientChartRoute[] = [
  {
    url: "/patient/:patientUuid/chart/allergy",
    component: AllergyOverviewLevelTwo,
    name: "Allergy"
  },
  {
    url: "/patient/:patientUuid/chart/allergy/form/:allergyUuid?",
    component: AllergyForm,
    name: "Allergy Form"
  },
  {
    url: "/patient/:patientUuid/chart/allergy/:allergyUuid",
    component: AllergyCardLevelThree,
    name: "Allergy"
  },
  {
    url: "/patient/:patientUuid/chart/dimensions",
    component: HeightAndWeightDetailed,
    name: "Dimensions"
  },
  {
    url: "/patient/:patientUuid/chart/vitals",
    component: VitalsDetailedSummary,
    name: "Vitals"
  },
  {
    url: "/patient/:patientUuid/chart/vitals/form/:vitalsUuid?",
    component: VitalsForm,
    name: "Vitals Form"
  },
  {
    url: "/patient/:patientUuid/chart/programs",
    component: ProgramsLevelTwo,
    name: "Programs"
  },
  {
    url: "/patient/:patientUuid/chart/medications",
    component: MedicationLevelTwo,
    name: "Medications"
  },
  {
    url: "/patient/:patientUuid/chart/conditions",
    component: ConditionsBriefSummary,
    name: "Conditions"
  }
];

export default function LevelTwoRoutes(props: LevelTwoRoutesProps) {
  return (
    <>
      {levelTwoRoutes.map(route => {
        const Component = route.component;
        return (
          <Route exact key={route.url} path={route.url} component={Component} />
        );
      })}
    </>
  );
}

type LevelTwoRoutesProps = {
  match: match;
};

export type PatientChartRoute = {
  name: string;
  url: string;
  component?: any;
};
