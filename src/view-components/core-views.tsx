import React from "react";
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
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  medicationsOverview: {
    name: "medicationsOverview",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  medicationsDetailedSummary: {
    name: "medicationsDetailedSummary",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  heightAndWeightOverview: {
    name: "heightAndWeightOverview",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  heightAndWeightDetailedSummary: {
    name: "heightAndWeightDetailedSummary",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  vitalsOverview: {
    name: "vitalsOverview",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  vitalsDetailedSummary: {
    name: "vitalsDetailedSummary",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  conditionsOverview: {
    name: "conditionsOverview",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  allergiesOverview: {
    name: "allergiesOverview",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  notesOverview: {
    name: "notesOverview",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  appointmentsOverview: {
    name: "appointmentsOverview",
    esModule: "@openmrs/esm-patient-chart-widgets"
  }
};

type CoreWidgetsType = {
  [key: string]: CoreWidgetType;
};

type CoreWidgetType = {
  name: string;
  esModule: string;
  params?: {};
};

type CoreDashboardsType = {
  [key: string]: DashboardConfigType;
};
