import React from "react";
import { useParams, useLocation, Link, useRouteMatch } from "react-router-dom";
import ChartWidget from "../../ui-components/chart-widget/chart-widget.component";
import ProgramsSummary from "../../widgets/programs/programs-summary.component";
import ConditionsDetailedSummary from "../../widgets/conditions/conditions-detailed-summary.component";
import { AllergyOverviewLevelTwo } from "../../widgets/allergies/allergy-card-level-two.component";
import styles from "../../ui-components/chart-widget/chart-widget.css";
import NotesOverview from "../../widgets/notes/notes-overview.component";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Encounters(props: any) {
  const match = useRouteMatch();

  const widgetConfig = {
    name: "encounters",
    defaultTabIndex: 1,
    tabs: [
      {
        name: "Overview",
        component: () => {
          return <div>placeholder</div>;
        }
      },
      {
        name: "Notes",
        component: () => {
          return <NotesOverview />;
        }
      }
    ]
  };

  return <ChartWidget {...props} widgetConfig={widgetConfig} />;
}
