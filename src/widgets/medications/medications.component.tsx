import React from "react";
import { Route, Link, Redirect, useHistory, useParams } from "react-router-dom";
import { AllergyOverviewLevelTwo } from "../allergies/allergy-card-level-two.component";
import MedicationLevelTwo from "./medication-level-two.component";

import styles from "../../summaries/summaries-nav.css";
import MedicationsChartOverview from "./medication-chart-overview.component";

import ChartWidget from "../../ui-components/chart-widget/chart-widget.component";

export default function Medications(props: any) {
  let { patientUuid } = useParams();

  const widgetConfig = {
    name: "medications",
    path: "/medications",
    defaultRoute: "overview",
    routes: [
      {
        name: "Overview",
        path: "/patient/:patientUuid/chart/medications/overview",
        link: `/patient/${patientUuid}/chart/medications/overview`,
        component: MedicationsChartOverview
      },
      {
        name: "Medication Orders",
        path: "/patient/:patientUuid/chart/medications/medication-orders",
        link: `/patient/${patientUuid}/chart/medications/medication-orders`,
        component: MedicationLevelTwo
      },
      {
        name: "Allergies",
        path: "/patient/:patientUuid/chart/medications/allergies",
        link: `/patient/${patientUuid}/chart/medications/allergies`,
        component: AllergyOverviewLevelTwo
      }
    ]
  };

  return <ChartWidget {...props} widgetConfig={widgetConfig} />;
}
