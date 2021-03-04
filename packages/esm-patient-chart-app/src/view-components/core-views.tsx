import { WidgetConfig } from "./widget/widget.component";
import { DashboardConfig } from "./dashboard/dashboard.component";

export const coreWidgetDefinitions: Array<WidgetConfig> = [
  {
    name: "ProgramsOverview",
    extensionSlotName: "programs-overview-widget-ext"
  },
  {
    name: "ProgramsSummary",
    extensionSlotName: "programs-summary-widget-ext"
  },
  {
    name: "Immunizations",
    extensionSlotName: "immunizations-widget-ext"
  },
  {
    name: "MedicationsOverview",
    extensionSlotName: "patient-chart-dashboard-medications"
  },
  {
    name: "MedicationsSummary",
    extensionSlotName: "patient-chart-dashboard-summary"
  },
  {
    name: "BiometricsOverview",
    extensionSlotName: "biometrics-widget"
  },
  {
    name: "BiometricsSummary",
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
    name: "ImmunizationsOverview",
    extensionSlotName: "immunizations-overview-widget-ext"
  },
  {
    name: "AllergiesOverview",
    extensionSlotName: "allergies-overview-widget-ext"
  },
  {
    name: "AllergiesSummary",
    extensionSlotName: "allergies-summary-widget-ext"
  },
  {
    name: "NotesOverview",
    extensionSlotName: "notes-overview-widget-ext"
  },
  {
    name: "Notes",
    extensionSlotName: "notes-overview-ext"
  },
  {
    name: "AppointmentsOverview",
    extensionSlotName: "appointments-overview-widget-ext"
  },
  {
    name: "AppointmentsSummary",
    extensionSlotName: "appointments-summary-widget-ext"
  },
  {
    name: "AttachmentsOverview",
    extensionSlotName: "attachments-overview-widget-ext"
  }
];

export const coreDashboardDefinitions: Array<DashboardConfig> = [
  {
    name: "summaryDashboard",
    title: "Overview",
    layout: {
      columns: 4
    },
    widgets: [
      {
        name: "ConditionsOverview",
        extensionSlotName: "conditions-overview-widget-ext",
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
        extensionSlotName: "immunizations-overview-widget-ext",
        layout: { columnSpan: 2 },
        basePath: "immunizations"
      },
      {
        name: "ProgramsOverview",
        extensionSlotName: "programs-overview-widget-ext",
        layout: { columnSpan: 2 },
        basePath: "programs"
      },
      {
        name: "AllergiesOverview",
        extensionSlotName: "allergies-overview-widget-ext",
        layout: { columnSpan: 2 },
        basePath: "allergies"
      },
      {
        name: "NotesOverview",
        extensionSlotName: "notes-overview-widget-ext",
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
        name: "BiometricsOverview",
        extensionSlotName: "biometrics-widget",
        layout: { columnSpan: 2 },
        basePath: "results/biometrics"
      },
      {
        name: "MedicationsOverview",
        extensionSlotName: "patient-chart-dashboard-medications",
        layout: { columnSpan: 3 },
        basePath: "orders/medication-orders"
      },
      {
        name: "AppointmentsOverview",
        extensionSlotName: "appointments-overview-widget-ext",
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
        extensionSlotName: "vitals-widget",
        basePath: "results/vitals"
      },
      {
        name: "BiometricsOverview",
        extensionSlotName: "biometrics-widget",
        basePath: "results/biometrics"
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
        extensionSlotName: "patient-chart-dashboard-medications",
        basePath: "orders/medication-orders"
      }
    ]
  },
  {
    name: "notesDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "Notes",
        extensionSlotName: "notes-overview-ext"
      }
    ]
  },
  {
    name: "conditionsDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "Conditions",
        extensionSlotName: "conditions-widget-ext"
      }
    ]
  },
  {
    name: "immunizationsDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "Immunizations",
        extensionSlotName: "immunizations-widget-ext"
      }
    ]
  },
  {
    name: "allergiesDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "AllergiesSummary",
        extensionSlotName: "allergies-summary-widget-ext"
      }
    ]
  },
  {
    name: "programsDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "ProgramsSummary",
        extensionSlotName: "programs-summary-widget-ext"
      }
    ]
  },
  {
    name: "appointmentsDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "AppointmentsSummary",
        extensionSlotName: "appointments-summary-widget-ext"
      }
    ]
  },
  {
    name: "AttachmentsOverview",
    layout: { columns: 1 },
    widgets: [
      {
        name: "AttachmentsOverview",
        extensionSlotName: "attachments-overview-widget-ext"
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
        path: "/biometrics",
        view: "BiometricsSummary"
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
