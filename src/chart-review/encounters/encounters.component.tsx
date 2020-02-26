import React from "react";
import { useLocation, useRouteMatch } from "react-router-dom";
import ChartWidget from "../../ui-components/multi-dashboard/chart-widget.component";
import styles from "../../ui-components/chart-widget/chart-widget.css";
import NotesOverview from "../../widgets/notes/notes-overview.component";
import NotesSummary from "../../widgets/notes/notes-summary.component";

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
          return <NotesOverview />;
        }
      },
      {
        name: "Notes",
        component: () => {
          return <NotesSummary />;
        }
      }
    ]
  };

  return <ChartWidget {...props} widgetConfig={widgetConfig} />;
}
