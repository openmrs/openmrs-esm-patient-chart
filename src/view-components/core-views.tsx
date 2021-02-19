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
    extensionSlotName: "patient-chart-dashboard-medications"
  },

  {
    name: "MedicationsSummary",
    extensionSlotName: "patient-chart-dashboard-medications"
  },

  {
    name: "HeightAndWeightOverview",
    extensionSlotName: "patient-chart-vitals"
  },

  {
    name: "HeightAndWeightSummary",
    extensionSlotName: "biometrics-widget"
  },

  {
    name: "VitalsOverview",
    extensionSlotName: "vitals-widget"
  },

  {
    name: "VitalsSummary",
    extensionSlotName: "vitals-widget"
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
        basePath: "conditions"
      },
      {
        name: "forms",
        extensionSlotName: "forms",
        layout: { columnSpan: 2 },
        basePath: "forms"
      },
      {
        name: "ImmunizationsOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        layout: { columnSpan: 2 },
        basePath: "immunizations"
      },
      {
        name: "ProgramsOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        layout: { columnSpan: 2 },
        basePath: "programs"
      },
      {
        name: "AllergiesOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        layout: { columnSpan: 2 },
        basePath: "allergies"
      },
      {
        name: "NotesOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        layout: { columnSpan: 4 },
        basePath: "encounters/notes"
      },
      {
        name: "VitalsOverview",
        extensionSlotName: "vitals-widget",
        layout: { columnSpan: 2 },
        basePath: "results/vitals"
      },
      {
        name: "HeightAndWeightOverview",
        extensionSlotName: "biometrics-widget",
        layout: { columnSpan: 2 },
        basePath: "results/heightAndWeight"
      },
      {
        name: "MedicationsOverview",
        layout: { columnSpan: 3 },
        basePath: "orders/medication-orders",
        extensionSlotName: "patient-chart-dashboard-summary"
      },
      {
        name: "AppointmentsOverview",
        esModule: "@openmrs/esm-patient-chart-widgets",
        layout: { columnSpan: 4 },
        basePath: "appointments"
      }
    ]
  },

  {
    name: "resultsOverviewDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "VitalsOverview",
        basePath: "results/vitals",
        extensionSlotName: "vitals-widget"
      },
      {
        name: "HeightAndWeightOverview",
        basePath: "results/heightAndWeight",
        extensionSlotName: "biometrics-widget"
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
        basePath: "orders/medication-orders",
        extensionSlotName: "patient-chart-dashboard-medications"
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
        label: "Vitals",
        path: "/vitals",
        view: "VitalsSummary"
      },
      {
        label: "Biometrics",
        path: "/heightAndWeight",
        view: "HeightAndWeightSummary"
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
