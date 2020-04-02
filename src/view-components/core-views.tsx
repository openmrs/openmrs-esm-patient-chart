import { DashboardConfig } from "./dashboard/dashboard.component";

export const coreWidgetDefinitions = [
  {
    name: "ProgramsOverview",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },
  {
    name: "ProgramsSummary",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  {
    name: "Conditions",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  {
    name: "MedicationsOverview",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  {
    name: "MedicationsSummary",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  {
    name: "HeightAndWeightOverview",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  {
    name: "HeightAndWeightSummary",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  {
    name: "VitalsOverview",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  {
    name: "VitalsSummary",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  {
    name: "ConditionsOverview",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  {
    name: "AllergiesOverview",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  {
    name: "AllergiesSummary",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  {
    name: "NotesOverview",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  {
    name: "Notes",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },

  {
    name: "AppointmentsOverview",
    esModule: "@openmrs/esm-patient-chart-widgets"
  },
  {
    name: "AppointmentsSummary",
    esModule: "@openmrs/esm-patient-chart-widgets"
  }
];

export const coreDashboardDefinitions = [
  {
    name: "summaryDashboard",
    title: "Overview",
    layout: {
      columns: 4
    },
    widgets: [
      {
        name: "ConditionsOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        layout: { columnSpan: 2 }
      },
      {
        name: "ProgramsOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        layout: { columnSpan: 2 }
      },
      {
        name: "NotesOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        layout: { columnSpan: 4 },
        params: {
          basePath: "encounters/notes"
        }
      },
      {
        name: "VitalsOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        layout: { columnSpan: 2 },
        params: {
          basePath: "results/vitals"
        }
      },
      {
        name: "HeightAndWeightOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        layout: { columnSpan: 2 },
        params: {
          basePath: "results/heightAndWeight"
        }
      },
      {
        name: "MedicationsOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        layout: { columnSpan: 3 },
        params: {
          basePath: "orders/medication-orders"
        }
      },
      {
        name: "AllergiesOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        layout: { columnSpan: 1 },
        params: {
          basePath: "allergies"
        }
      },
      {
        name: "AppointmentsOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        layout: { columnSpan: 4 },
        params: {
          basePath: "appointments"
        }
      }
    ]
  },

  {
    name: "resultsOverviewDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "VitalsOverview",
        esModule: "@openmrs/esm-patient-chart-widgets"
      },
      {
        name: "HeightAndWeightOverview",
        esModule: "@openmrs/esm-patient-chart-widgets"
      }
    ]
  },

  {
    name: "ordersOverviewDashboard",
    title: "Orders Overview",
    layout: { columns: 1 },
    widgets: [
      {
        name: "MedicationsOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        params: {
          basePath: "orders/medication-orders"
        }
      }
    ]
  },

  {
    name: "notesDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "Notes",
        esModule: "@openmrs/esm-patient-chart-widgets"
      }
    ]
  },

  {
    name: "conditionsDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "Conditions",
        esModule: "@openmrs/esm-patient-chart-widgets"
      }
    ]
  },

  {
    name: "allergiesDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "AllergiesSummary",
        esModule: "@openmrs/esm-patient-chart-widgets"
      }
    ]
  },

  {
    name: "programsDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "ProgramsSummary",
        esModule: "@openmrs/esm-patient-chart-widgets"
      }
    ]
  },

  {
    name: "appointmentsDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "AppointmentsSummary",
        esModule: "@openmrs/esm-patient-chart-widgets"
      }
    ]
  }
];

export const coreTabbedViewDefinitions = [
  {
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
        view: "VitalsSummary"
      },
      {
        label: "Height and Weight",
        path: "/heightAndWeight",
        view: "HeightAndWeightSummary"
      }
    ]
  },

  {
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
        view: "MedicationsSummary"
      }
    ]
  },

  {
    name: "encountersTabbedView",
    title: "Encounters",

    navbar: [
      {
        label: "Notes",
        path: "/notes",
        view: "notesDashboard"
      }
    ]
  }
];

type CoreWidgets = {
  [key: string]: CoreWidget;
};

type CoreWidget = {
  name: string;
  esModule: string;
  params?: {};
};

type CoreDashboards = {
  [key: string]: DashboardConfig;
};
