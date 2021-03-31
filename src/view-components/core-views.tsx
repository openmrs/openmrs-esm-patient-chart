import { WidgetConfig } from "./widget/widget.component";
import { DashboardConfig } from "./dashboard/dashboard.component";

export const coreWidgetDefinitions: Array<WidgetConfig> = [
  {
    name: "ProgramsOverview",
    extensionSlotName: "programs-overview-widget-slot"
  },
  {
    name: "ProgramsSummary",
    extensionSlotName: "programs-summary-widget-slot"
  },
  {
    name: "Immunizations",
    extensionSlotName: "immunizations-widget-slot"
  },
  {
    name: "MedicationsOverview",
    extensionSlotName: "patient-chart-dashboard-medications-slot"
  },
  {
    name: "MedicationsSummary",
    extensionSlotName: "patient-chart-dashboard-summary-slot"
  },
  {
    name: "BiometricsOverview",
    extensionSlotName: "biometrics-widget-slot"
  },
  {
    name: "BiometricsSummary",
    extensionSlotName: "biometrics-widget-slot"
  },
  {
    name: "VitalsOverview",
    extensionSlotName: "vitals-widget-slot"
  },
  {
    name: "VitalsSummary",
    extensionSlotName: "vitals-widget-slot"
  },
  {
    name: "ImmunizationsOverview",
    extensionSlotName: "immunizations-overview-widget-slot"
  },
  {
    name: "AllergiesOverview",
    extensionSlotName: "allergies-overview-widget-slot"
  },
  {
    name: "AllergiesSummary",
    extensionSlotName: "allergies-summary-widget-slot"
  },
  {
    name: "NotesOverview",
    extensionSlotName: "notes-overview-widget-slot"
  },
  {
    name: "Notes",
    extensionSlotName: "notes-overview-slot"
  },
  {
    name: "AppointmentsOverview",
    extensionSlotName: "appointments-overview-widget-slot"
  },
  {
    name: "AppointmentsSummary",
    extensionSlotName: "appointments-summary-widget-slot"
  },
  {
    name: "AttachmentsOverview",
    extensionSlotName: "attachments-overview-widget-slot"
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
        extensionSlotName: "conditions-overview-widget-slot",
        layout: { columnSpan: 2 },
        basePath: "conditions"
      },
      {
        name: "forms",
        extensionSlotName: "forms-slot",
        layout: { columnSpan: 2 },
        basePath: "forms"
      },
      {
        name: "ImmunizationsOverview",
        extensionSlotName: "immunizations-overview-widget-slot",
        layout: { columnSpan: 2 },
        basePath: "immunizations"
      },
      {
        name: "ProgramsOverview",
        extensionSlotName: "programs-overview-widget-slot",
        layout: { columnSpan: 2 },
        basePath: "programs"
      },
      {
        name: "AllergiesOverview",
        extensionSlotName: "allergies-overview-widget-slot",
        layout: { columnSpan: 2 },
        basePath: "allergies"
      },
      {
        name: "NotesOverview",
        extensionSlotName: "notes-overview-widget-slot",
        layout: { columnSpan: 4 },
        basePath: "encounters/notes"
      },
      {
        name: "VitalsOverview",
        extensionSlotName: "vitals-widget-slot",
        layout: { columnSpan: 2 },
        basePath: "results/vitals"
      },
      {
        name: "BiometricsOverview",
        extensionSlotName: "biometrics-widget-slot",
        layout: { columnSpan: 2 },
        basePath: "results/biometrics"
      },
      {
        name: "MedicationsOverview",
        extensionSlotName: "patient-chart-dashboard-medications-slot",
        layout: { columnSpan: 3 },
        basePath: "orders/medication-orders"
      },
      {
        name: "AppointmentsOverview",
        extensionSlotName: "appointments-overview-widget-slot",
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
        extensionSlotName: "vitals-widget-slot",
        basePath: "results/vitals"
      },
      {
        name: "BiometricsOverview",
        extensionSlotName: "biometrics-widget-slot",
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
        extensionSlotName: "patient-chart-dashboard-medications-slot",
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
        extensionSlotName: "notes-overview-slot"
      }
    ]
  },
  {
    name: "conditionsDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "Conditions",
        extensionSlotName: "conditions-widget-slot"
      }
    ]
  },
  {
    name: "immunizationsDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "Immunizations",
        extensionSlotName: "immunizations-widget-slot"
      }
    ]
  },
  {
    name: "allergiesDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "AllergiesSummary",
        extensionSlotName: "allergies-summary-widget-slot"
      }
    ]
  },
  {
    name: "programsDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "ProgramsSummary",
        extensionSlotName: "programs-summary-widget-slot"
      }
    ]
  },
  {
    name: "appointmentsDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "AppointmentsSummary",
        extensionSlotName: "appointments-summary-widget-slot"
      }
    ]
  },
  {
    name: "AttachmentsOverview",
    layout: { columns: 1 },
    widgets: [
      {
        name: "AttachmentsOverview",
        extensionSlotName: "attachments-overview-widget-slot"
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
