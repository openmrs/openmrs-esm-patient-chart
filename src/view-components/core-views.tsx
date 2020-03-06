import React from "react";

import {
  HeightAndWeightOverview,
  HeightAndWeightSummary,
  VitalsOverview,
  VitalsSummary,
  ConditionsOverview,
  AllergiesOverview,
  NotesOverview,
  ProgramsOverview,
  MedicationsOverview,
  MedicationsSummary,
  AppointmentsOverview
} from "@openmrs/esm-patient-chart-widgets";

import { DashboardConfigType } from "./dashboard/dashboard.component";

export const coreTabbedViews = {
  resultsTabbedView: {
    name: "resultsTabbedView",
    title: "Results",

    navbar: [
      {
        label: "Overview",
        path: "/overview",
        view: "resultsOverviewDashboard"
      },
      {
        label: "Vitals",
        path: "/vitals",
        view: "vitalsDetailedSummary"
      },
      {
        label: "Height and Weight",
        path: "/heightAndWeight",
        view: "heightAndWeightDetailedSummary"
      }
    ]
  },

  ordersTabbedView: {
    name: "ordersTabbedView",
    title: "Orders",

    navbar: [
      {
        label: "Overview",
        path: "/overview",
        view: "ordersOverviewDashboard"
      },
      {
        label: "Medication Orders",
        path: "/medication-orders",
        view: "medicationsDetailedSummary"
      }
    ]
  }
};

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
        name: "allergiesOverview",
        layout: { columnSpan: 1 }
      },
      {
        name: "appointmentsOverview",
        layout: { columnSpan: 4 }
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
    widgets: [{ name: "allergiesOverview" }]
  },

  programsOverviewDashboard: {
    name: "programsOverviewDashboard",
    widgets: [{ name: "programsOverview" }]
  },

  appointmentsOverviewDashboard: {
    name: "appointmentsOverviewDashboard",
    widgets: [{ name: "appointmentsOverview" }]
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

  medicationsDetailedSummary: {
    name: "medicationsDetailedSummary",
    component: () => {
      return <MedicationsSummary />;
    }
  },

  heightAndWeightOverview: {
    name: "heightAndWeightOverview",
    component: () => {
      return <HeightAndWeightOverview />;
    }
  },

  heightAndWeightDetailedSummary: {
    name: "heightAndWeightDetailedSummary",
    component: () => {
      return <HeightAndWeightSummary />;
    }
  },

  vitalsOverview: {
    name: "vitalsOverview",
    component: () => {
      return <VitalsOverview />;
    }
  },

  vitalsDetailedSummary: {
    name: "vitalsDetailedSummary",
    component: () => {
      return <VitalsSummary />;
    }
  },

  conditionsOverview: {
    name: "conditionsOverview",
    component: () => {
      return <ConditionsOverview />;
    }
  },

  allergiesOverview: {
    name: "allergiesOverview",
    component: () => {
      return <AllergiesOverview />;
    }
  },

  notesOverview: {
    name: "notesOverview",
    component: () => {
      return <NotesOverview />;
    }
  },

  appointmentsOverview: {
    name: "appointmentsOverview",
    component: () => {
      return <AppointmentsOverview />;
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
