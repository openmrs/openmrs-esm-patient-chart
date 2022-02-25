export interface DashbardLayoutConfig {
  columns: number;
}

export interface DashboardConfig {
  name: string;
  slot: string;
  title: string;
  config: DashbardLayoutConfig;
}
