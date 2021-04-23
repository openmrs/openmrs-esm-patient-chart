export const mockedTabbedViewConfig = {
  primaryNavbar: [
    { label: "Summary", path: "/summary", view: "summaryDashboard" },
    { label: "Results", path: "/results", view: "resultsTabbedView" },
    { label: "Orders", path: "/orders", view: "MedicationsOverview" },
    { label: "Encounters", path: "/encounters", view: "encountersTabbedView" },
    { label: "Conditions", path: "/conditions", view: "conditionsDashboard" },
    { label: "Programs", path: "/programs", view: "programsDashboard" },
    { label: "Allergies", path: "/allergies", view: "allergiesDashboard" },
    {
      label: "Appointments",
      path: "/appointments",
      view: "appointmentsDashboard",
    },
  ],
  widgetDefinitions: [
    {
      name: "ProgramsOverview",
      esModule: "@openmrs/esm-patient-chart-widgets",
      usesSingleSpaContext: {},
    },
    {
      name: "ProgramsSummary",
      esModule: "@openmrs/esm-patient-chart-widgets",
      usesSingleSpaContext: {},
    },
    {
      name: "Conditions",
      esModule: "@openmrs/esm-patient-chart-widgets",
      usesSingleSpaContext: {},
    },
    {
      name: "MedicationsOverview",
      esModule: "@openmrs/esm-patient-chart-widgets",
      usesSingleSpaContext: {},
    },
    {
      name: "MedicationsSummary",
      esModule: "@openmrs/esm-patient-chart-widgets",
      usesSingleSpaContext: {},
    },
    {
      name: "HeightAndWeightOverview",
      esModule: "@openmrs/esm-patient-chart-widgets",
      usesSingleSpaContext: {},
    },
    {
      name: "HeightAndWeightSummary",
      esModule: "@openmrs/esm-patient-chart-widgets",
      usesSingleSpaContext: {},
    },
    {
      name: "VitalsOverview",
      esModule: "@openmrs/esm-patient-chart-widgets",
      usesSingleSpaContext: {},
    },
    {
      name: "VitalsSummary",
      esModule: "@openmrs/esm-patient-chart-widgets",
      usesSingleSpaContext: {},
    },
    {
      name: "ConditionsOverview",
      esModule: "@openmrs/esm-patient-chart-widgets",
      usesSingleSpaContext: {},
    },
    {
      name: "AllergiesOverview",
      esModule: "@openmrs/esm-patient-chart-widgets",
      usesSingleSpaContext: {},
    },
    {
      name: "AllergiesSummary",
      esModule: "@openmrs/esm-patient-chart-widgets",
      usesSingleSpaContext: {},
    },
    {
      name: "NotesOverview",
      esModule: "@openmrs/esm-patient-chart-widgets",
      usesSingleSpaContext: {},
    },
    {
      name: "Notes",
      esModule: "@openmrs/esm-patient-chart-widgets",
      usesSingleSpaContext: {},
    },
    {
      name: "AppointmentsOverview",
      esModule: "@openmrs/esm-patient-chart-widgets",
      usesSingleSpaContext: {},
    },
    {
      name: "AppointmentsSummary",
      esModule: "@openmrs/esm-patient-chart-widgets",
      usesSingleSpaContext: {},
    },
  ],
  dashboardDefinitions: [
    {
      name: "summaryDashboard",
      title: "Overview",
      layout: { columns: 4 },
      widgets: [
        {
          name: "ConditionsOverview",
          esModule: "@openmrs/esm-patient-chart-widgets",
          layout: { columnSpan: 2 },
          params: { basePath: "conditions" },
        },
        {
          name: "ProgramsOverview",
          esModule: "@openmrs/esm-patient-chart-widgets",
          layout: { columnSpan: 2 },
        },
        {
          name: "NotesOverview",
          esModule: "@openmrs/esm-patient-chart-widgets",
          layout: { columnSpan: 4 },
          params: { basePath: "encounters/notes" },
        },
        {
          name: "VitalsOverview",
          esModule: "@openmrs/esm-patient-chart-widgets",
          layout: { columnSpan: 2 },
          params: { basePath: "results/vitals" },
        },
        {
          name: "HeightAndWeightOverview",
          esModule: "@openmrs/esm-patient-chart-widgets",
          layout: { columnSpan: 2 },
          params: { basePath: "results/heightAndWeight" },
        },
        {
          name: "MedicationsOverview",
          esModule: "@openmrs/esm-patient-chart-widgets",
          layout: { columnSpan: 3 },
          params: { basePath: "orders/medication-orders" },
        },
        {
          name: "AllergiesOverview",
          esModule: "@openmrs/esm-patient-chart-widgets",
          layout: { columnSpan: 1 },
          params: { basePath: "allergies" },
        },
        {
          name: "AppointmentsOverview",
          esModule: "@openmrs/esm-patient-chart-widgets",
          layout: { columnSpan: 4 },
          params: { basePath: "appointments" },
        },
      ],
    },
    {
      name: "resultsOverviewDashboard",
      layout: { columns: 1 },
      widgets: [
        {
          name: "VitalsOverview",
          esModule: "@openmrs/esm-patient-chart-widgets",
          params: { basePath: "results/vitals" },
        },
        {
          name: "HeightAndWeightOverview",
          esModule: "@openmrs/esm-patient-chart-widgets",
          params: { basePath: "results/heightAndWeight" },
        },
      ],
      title: {},
    },
    {
      name: "ordersOverviewDashboard",
      title: "Orders Overview",
      layout: { columns: 1 },
      widgets: [
        {
          name: "MedicationsOverview",
          esModule: "@openmrs/esm-patient-chart-widgets",
          params: { basePath: "orders/medication-orders" },
        },
      ],
    },
    {
      name: "notesDashboard",
      layout: { columns: 1 },
      widgets: [
        { name: "Notes", esModule: "@openmrs/esm-patient-chart-widgets" },
      ],
      title: {},
    },
    {
      name: "conditionsDashboard",
      layout: { columns: 1 },
      widgets: [
        { name: "Conditions", esModule: "@openmrs/esm-patient-chart-widgets" },
      ],
      title: {},
    },
    {
      name: "allergiesDashboard",
      layout: { columns: 1 },
      widgets: [
        {
          name: "AllergiesSummary",
          esModule: "@openmrs/esm-patient-chart-widgets",
        },
      ],
      title: {},
    },
    {
      name: "programsDashboard",
      layout: { columns: 1 },
      widgets: [
        {
          name: "ProgramsSummary",
          esModule: "@openmrs/esm-patient-chart-widgets",
        },
      ],
      title: {},
    },
    {
      name: "appointmentsDashboard",
      layout: { columns: 1 },
      widgets: [
        {
          name: "AppointmentsSummary",
          esModule: "@openmrs/esm-patient-chart-widgets",
        },
      ],
      title: {},
    },
  ],
  tabbedViewDefinitions: [
    {
      name: "resultsTabbedView",
      title: "Results",
      navbar: [
        {
          label: "Overview",
          path: "/overview",
          view: "resultsOverviewDashboard",
        },
        { label: "Vitals", path: "/vitals", view: "VitalsSummary" },
        {
          label: "Height and Weight",
          path: "/heightAndWeight",
          view: "HeightAndWeightSummary",
        },
      ],
    },
    {
      name: "encountersTabbedView",
      title: "Encounters",
      navbar: [{ label: "Notes", path: "/notes", view: "notesDashboard" }],
    },
  ],
};

export const mockConfig = {
  name: "resultsTabbedView",
  title: "Results",
  navbar: [
    { label: "Overview", path: "/overview", view: "resultsOverviewDashboard" },
    { label: "Vitals", path: "/vitals", view: "VitalsSummary" },
    {
      label: "Height and Weight",
      path: "/heightAndWeight",
      view: "HeightAndWeightSummary",
    },
  ],
};

export const mockDefaultPath =
  "/patient/0b1b7481-704b-440f-a50f-3b7d0abac8c1/chart/results";
