import React from "react";
import { useParams } from "react-router-dom";
import ChartWidget from "../../ui-components/chart-widget/chart-widget.component";
import HistoryChartOverview from "./history-chart-overview.component";
import ProgramsLevelTwo from "../../widgets/programs/programs-level-two.component";
import ConditionsDetailedSummary from "../../widgets/conditions/conditions-detailed-summary.component";
import { AllergyOverviewLevelTwo } from "../../widgets/allergies/allergy-card-level-two.component";

export default function History(props: any) {
  let { patientUuid } = useParams();

  const widgetConfig = {
    name: "history",
    path: "/history",
    defaultRoute: "overview",
    routes: [
      {
        name: "Overview",
        path: "/patient/:patientUuid/chart/history/overview",
        link: `/patient/${patientUuid}/chart/history/overview`,
        component: HistoryChartOverview
      },
      {
        name: "Conditions",
        path: "/patient/:patientUuid/chart/history/conditions",
        link: `/patient/${patientUuid}/chart/history/conditions`,
        component: ConditionsDetailedSummary
      },
      {
        name: "Programs",
        path: "/patient/:patientUuid/chart/history/programs",
        link: `/patient/${patientUuid}/chart/history/programs`,
        component: ProgramsLevelTwo
      },
      {
        name: "Allergies",
        path: "/patient/:patientUuid/chart/history/allergies",
        link: `/patient/${patientUuid}/chart/history/allergies`,
        component: AllergyOverviewLevelTwo
      }
    ]
  };

  return <ChartWidget {...props} widgetConfig={widgetConfig} />;
}
