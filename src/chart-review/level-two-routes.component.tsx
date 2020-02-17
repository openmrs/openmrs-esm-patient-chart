import React, { FunctionComponent } from "react";
import { match, Route } from "react-router";
import { AllergyOverviewLevelTwo } from "../widgets/allergies/allergy-card-level-two.component";
import HeightAndWeightSummary from "../widgets/heightandweight/heightandweight-summary.component";
import VitalsDetailedSummary from "../widgets/vitals/vitals-detailed-summary.component";
import { Breadcrumbs } from "../breadcrumbs/breadcrumbs.component";
import ProgramsLevelTwo from "../widgets/programs/programs-level-two.component";
import { AllergyForm } from "../widgets/allergies/allergy-form.component";
import { VitalsForm } from "../widgets/vitals/vitals-form.component";
import ConditionsSummary from "../widgets/conditions/conditions-summary.component";
import MedicationLevelTwo from "../widgets/medications/medication-level-two.component";
import { AllergyCardLevelThree } from "../widgets/allergies/allergy-card-level-three.component";
import ConditionsDetailedSummary from "../widgets/conditions/conditions-detailed-summary.component";
import { MedicationOrderBasket } from "../widgets/medications/medication-order-basket.component";
import { MedicationOrder } from "../widgets/medications/medication-order.component";
import { HeightAndWeightDetailedSummary } from "../widgets/heightandweight/heightandweight-detailed-summary.component";

export const levelTwoRoutes: PatientChartRoute[] = [
  {
    url: "/patient/:patientUuid/chart/allergies",
    component: AllergyOverviewLevelTwo,
    name: "Allergies"
  },
  {
    url: "/patient/:patientUuid/chart/allergies/:allergyUuid",
    component: AllergyCardLevelThree,
    name: "Allergies"
  },
  {
    url: "/patient/:patientUuid/chart/allergies/form/:allergyUuid?",
    component: AllergyForm,
    name: "Allergy Form"
  },
  {
    url: "/patient/:patientUuid/chart/conditions",
    component: ConditionsSummary,
    name: "Conditions"
  },
  {
    url: "/patient/:patientUuid/chart/conditions/:conditionUuid",
    component: ConditionsDetailedSummary,
    name: "Conditions"
  },
  {
    url: "/patient/:patientUuid/chart/dimensions",
    component: HeightAndWeightSummary,
    name: "Dimensions"
  },
  {
    url: "/patient/:patientUuid/chart/dimensions/details/:uuid?",
    component: HeightAndWeightDetailedSummary,
    name: "Detailed Dimensions"
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
    url:
      "/patient/:patientUuid/chart/medications/order/:orderUuid?/:drugUuid?/:action?",
    component: MedicationOrderBasket,
    name: "Order Medications"
  },
  {
    url: "/patient/:patientUuid/chart/medications/orderTest",
    component: MedicationOrder,
    name: "Order Medications"
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
