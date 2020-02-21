import React, { FunctionComponent } from "react";
import { RouteComponentProps } from "react-router";
import HeightAndWeightOverview from "../../../widgets/heightandweight/heightandweight-overview.component";
import VitalsOverview from "../../../widgets/vitals/vitals-overview.component";
import ConditionsOverview from "../../../widgets/conditions/conditions-overview.component";
import AllergyOverview from "../../../widgets/allergies/allergy-overview.component";
import NotesOverview from "../../../widgets/notes/notes-overview.component";
import ProgramsOverview from "../../../widgets/programs/programs-overview.component";
import MedicationsOverview from "../../../widgets/medications/medications-overview.component";
import Dashboard, {
  DashboardConfigType
} from "../../../ui-components/dashboard/dashboard.component";

export default function PatientChartOverview(props: PatientChartOverviewProps) {
  const dashboardConfig: DashboardConfigType = {
    layout: {
      columns: 3
    },
    widgets: [
      { name: "conditions-overview", component: ConditionsOverview },
      { name: "programs-overview", component: ProgramsOverview },
      { name: "allergey-overview", component: AllergyOverview },
      {
        name: "notes-overview",
        component: NotesOverview,
        layout: { columns: 2 }
      },
      {
        name: "vitals-overview",
        component: VitalsOverview,
        layout: { columns: 1 }
      },
      {
        name: "height-and-weight-overview",
        component: HeightAndWeightOverview
      },
      {
        name: "medications-overview",
        component: MedicationsOverview,
        layout: { columns: 2 }
      }
    ]
  };

  const coreComponents = {
    conditions: ConditionsOverview,
    programs: ProgramsOverview,
    allergies: AllergyOverview,
    notes: NotesOverview,
    vitals: VitalsOverview,
    heightAndWeight: HeightAndWeightOverview,
    medications: MedicationsOverview
  };

  return <Dashboard dashboardConfig={dashboardConfig} />;
}

type PatientChartOverviewProps = {
  match: {};
};
