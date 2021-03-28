export interface DashbardGridConfig {
  columns: number;
  type: "grid";
}

export interface DashboardTabConfig {
  type: "tabs";
}

export type DashbardLayoutConfig = DashbardGridConfig | DashboardTabConfig;

export interface DashboardConfig {
  name: string;
  slot: string;
  title: string;
  config: DashbardLayoutConfig;
}

export const defaultDashboardDefinitions: Array<DashboardConfig> = [
  {
    name: "summary",
    slot: "patient-chart-summary-dashboard-slot",
    config: { columns: 4, type: "grid" },
    title: "Summary"
  },
  {
    name: "results",
    slot: "patient-chart-results-dashboard-slot",
    config: { type: "tabs" },
    title: "Results"
  },
  {
    name: "orders",
    slot: "patient-chart-orders-dashboard-slot",
    config: { columns: 1, type: "grid" },
    title: "Orders"
  },
  {
    name: "encounters",
    slot: "patient-chart-encounters-dashboard-slot",
    config: { type: "tabs" },
    title: "Encounters"
  },
  {
    name: "conditions",
    slot: "patient-chart-conditions-dashboard-slot",
    config: { columns: 1, type: "grid" },
    title: "Conditions"
  },
  {
    name: "immunizations",
    slot: "patient-chart-immunizations-dashboard-slot",
    config: { columns: 1, type: "grid" },
    title: "Immunizations"
  },
  {
    name: "allergies",
    slot: "patient-chart-allergies-dashboard-slot",
    config: { columns: 1, type: "grid" },
    title: "Allergies"
  },
  {
    name: "programs",
    slot: "patient-chart-programs-dashboard-slot",
    config: { columns: 1, type: "grid" },
    title: "Programs"
  },
  {
    name: "appointments",
    slot: "patient-chart-appointments-dashboard-slot",
    config: { columns: 1, type: "grid" },
    title: "Appointments"
  },
  {
    name: "attachments",
    slot: "patient-chart-attachments-dashboard-slot",
    config: { columns: 1, type: "grid" },
    title: "Attachments"
  }
];
