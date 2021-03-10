export interface DashboardConfig {
  name: string;
  title?: string;
  extensionSlotName: string;
  layout: {
    columns: number;
  };
}

export const defaultDashboardDefinitions: Array<DashboardConfig> = [
  {
    name: "summaryDashboard",
    title: "Overview",
    extensionSlotName: "patient-chart-summary-dashboard-slot",
    layout: { columns: 4 }
  },
  {
    name: "resultsOverviewDashboard",
    extensionSlotName: "patient-chart-results-dashboard-slot",
    layout: { columns: 1 }
  },
  {
    name: "ordersOverviewDashboard",
    title: "Orders Overview",
    extensionSlotName: "patient-chart-orders-dashboard-slot",
    layout: { columns: 1 }
  },
  {
    name: "notesDashboard",
    extensionSlotName: "patient-chart-notes-dashboard-slot",
    layout: { columns: 1 }
  },
  {
    name: "conditionsDashboard",
    extensionSlotName: "patient-chart-conditions-dashboard-slot",
    layout: { columns: 1 }
  },
  {
    name: "immunizationsDashboard",
    extensionSlotName: "patient-chart-immunization-dashboard-slot",
    layout: { columns: 1 }
  },
  {
    name: "allergiesDashboard",
    extensionSlotName: "patient-chart-allergies-dashboard-slot",
    layout: { columns: 1 }
  },
  {
    name: "programsDashboard",
    extensionSlotName: "patient-chart-programs-dashboard-slot",
    layout: { columns: 1 }
  },
  {
    name: "appointmentsDashboard",
    extensionSlotName: "patient-chart-appointments-dashboard-slot",
    layout: { columns: 1 }
  },
  {
    name: "attachmentsOverview",
    extensionSlotName: "patient-chart-attachments-dashboard-slot",
    layout: { columns: 1 }
  }
];
