import React from "react";
import Dashboard, {
  DashboardConfigType
} from "../../../ui-components/dashboard/dashboard.component";

export default function PatientChartOverview(props: PatientChartOverviewProps) {
  const dashboardConfig: DashboardConfigType = {
    name: "overview",
    title: "Overview",
    layout: {
      columns: 4
    },
    widgets: [
      {
        name: "conditionsOverview",
        layout: { columnSpan: 2 }
      },
      {
        name: "programsOverview",
        layout: { columnSpan: 2 }
      },
      {
        name: "notesOverview",
        layout: { columnSpan: 4 }
      },
      {
        name: "vitalsOverview",
        layout: { columnSpan: 2 }
      },
      {
        name: "heightAndWeightOverview",
        layout: { columnSpan: 2 }
      },
      {
        name: "medicationsOverview",
        layout: { columnSpan: 3 }
      },
      {
        name: "allergyOverview",
        layout: { columnSpan: 1 }
      }
    ]
  };

  return <Dashboard dashboardConfig={dashboardConfig} />;
}

type PatientChartOverviewProps = {};
