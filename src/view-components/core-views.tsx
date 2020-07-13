import { WidgetConfig } from "./widget/widget.component";
import { DashboardConfig } from "./dashboard/dashboard.component";

export const coreWidgetDefinitions: WidgetConfig[] = [
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
    name: "Immunizations",
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
    name: "ImmunizationsOverview",
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
  },
  {
    name: "AttachmentsOverview",
    esModule: "@openmrs/esm-patient-chart-widgets"
  }
];

export const coreDashboardDefinitions: DashboardConfig[] = [
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
        layout: { columnSpan: 2 },
        props: {
          basePath: "conditions"
        }
      },
      {
        name: "ImmunizationsOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        layout: { columnSpan: 2 },
        props: {
          basePath: "immunizations"
        }
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
        props: {
          basePath: "encounters/notes"
        }
      },
      {
        name: "VitalsOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        layout: { columnSpan: 2 },
        props: {
          basePath: "results/vitals"
        }
      },
      {
        name: "HeightAndWeightOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        layout: { columnSpan: 2 },
        props: {
          basePath: "results/heightAndWeight"
        }
      },
      {
        name: "MedicationsOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        layout: { columnSpan: 3 },
        props: {
          basePath: "orders/medication-orders"
        }
      },
      {
        name: "AllergiesOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        layout: { columnSpan: 1 },
        props: {
          basePath: "allergies"
        }
      },
      {
        name: "AppointmentsOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        layout: { columnSpan: 4 },
        props: {
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
        esModule: "@openmrs/esm-patient-chart-widgets",
        props: {
          basePath: "results/vitals"
        }
      },
      {
        name: "HeightAndWeightOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        props: {
          basePath: "results/heightAndWeight"
        }
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
        props: {
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
    name: "immunizationsDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "Immunizations",
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
  },
  {
    name: "AttachmentsOverview",
    layout: { columns: 1 },
    widgets: [
      {
        name: "AttachmentsOverview",
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
