import React from "react";

import HeightAndWeightOverview from "../widgets/heightandweight/heightandweight-overview.component";
import VitalsOverview from "../widgets/vitals/vitals-overview.component";
import ConditionsOverview from "../widgets/conditions/conditions-overview.component";
import AllergyOverview from "../widgets/allergies/allergy-overview.component";
import NotesOverview from "../widgets/notes/notes-overview.component";
import ProgramsOverview from "../widgets/programs/programs-overview.component";
import MedicationsOverview from "../widgets/medications/medications-overview.component";
import { DashboardConfigType } from "./dashboard/dashboard.component";

const coreMultiDashboards = {};
export const coreDashboards: CoreDashboardsType = {
  summaryDashboard: {
    name: "summaryDashboard",
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
  },

  resultsOverviewDashboard: {
    name: "resultsOverviewDashboard",
    layout: { columns: 1 },
    widgets: [{ name: "vitalsOverview" }, { name: "heightAndWeightOverview" }]
  },

  ordersOverviewDashboard: {
    name: "ordersOverviewDashboard",
    title: "Orders Overview",
    layout: { columns: 1 },
    widgets: [{ name: "medicationsOverview" }]
  },

  encountersOverviewDashboard: {
    name: "encountersOverviewDashboard",
    widgets: [{ name: "notesOverview" }]
  },

  conditionsOverviewDashboard: {
    name: "conditionsOverviewDashboard",
    widgets: [{ name: "conditionsOverview" }]
  },

  allergiesOverviewDashboard: {
    name: "allergiesOverviewDashboard",
    widgets: [{ name: "allergyOverview" }]
  },

  programsOverviewDashboard: {
    name: "programsOverviewDashboard",
    widgets: [{ name: "programsOverview" }]
  }
};

export const coreWidgets: CoreWidgetsType = {
  programsOverview: {
    name: "programsOverview",
    component: () => {
      return <ProgramsOverview />;
    }
  },

  medicationsOverview: {
    name: "medicationsOverview",
    component: () => {
      return <MedicationsOverview />;
    }
  },

  heightAndWeightOverview: {
    name: "heightAndWeightOverview",
    component: () => {
      return <HeightAndWeightOverview />;
    }
  },

  vitalsOverview: {
    name: "vitalsOverview",
    component: () => {
      return <VitalsOverview />;
    }
  },

  conditionsOverview: {
    name: "conditionsOverview",
    component: () => {
      return <ConditionsOverview />;
    }
  },

  allergyOverview: {
    name: "allergyOverview",
    component: () => {
      return <AllergyOverview />;
    }
  },

  notesOverview: {
    name: "notesOverview",
    component: () => {
      return <NotesOverview />;
    }
  }
};

type CoreWidgetsType = {
  [key: string]: CoreWidgetType;
};

type CoreWidgetType = {
  name: string;
  params?: {};
  component: Function;
};

type CoreDashboardsType = {
  [key: string]: DashboardConfigType;
};
