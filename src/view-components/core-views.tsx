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
    name: "Conditions",
    extensionSlotName: "conditions-widget-ext"
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
        layout: { columnSpan: 2 },
        basePath: "conditions"
      },
      {
        name: "ImmunizationsOverview",
        layout: { columnSpan: 2 },
        basePath: "immunizations"
      },
      {
        name: "ProgramsOverview",
        layout: { columnSpan: 2 },
        basePath: "programs"
      },
      {
        name: "AllergiesOverview",
        layout: { columnSpan: 2 },
        basePath: "allergies"
      },
      {
        name: "NotesOverview",
        layout: { columnSpan: 4 },
        basePath: "encounters/notes"
      },
      {
        name: "VitalsOverview",
        layout: { columnSpan: 2 },
        basePath: "results/vitals"
      },
      {
        name: "HeightAndWeightOverview",
        layout: { columnSpan: 2 },
        basePath: "results/heightAndWeight"
      },
      {
        name: "MedicationsOverview",
        layout: { columnSpan: 3 },
        basePath: "orders/medication-orders"
      },
      {
        name: "AppointmentsOverview",
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
        basePath: "results/vitals"
      },
      {
        name: "HeightAndWeightOverview",
        basePath: "results/heightAndWeight"
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
        basePath: "orders/medication-orders"
      }
    ]
  },
  {
    name: "notesDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "Notes"
      }
    ]
  },
  {
    name: "conditionsDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "Conditions"
      }
    ]
  },
  {
    name: "immunizationsDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "Immunizations"
      }
    ]
  },
  {
    name: "allergiesDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "AllergiesSummary"
      }
    ]
  },
  {
    name: "programsDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "ProgramsSummary"
      }
    ]
  },
  {
    name: "appointmentsDashboard",
    layout: { columns: 1 },
    widgets: [
      {
        name: "AppointmentsSummary"
      }
    ]
  },
  {
    name: "AttachmentsOverview",
    layout: { columns: 1 },
    widgets: [
      {
        name: "AttachmentsOverview"
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
