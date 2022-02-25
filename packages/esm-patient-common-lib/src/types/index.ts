export * from './test-results';
export * from './workspace';

export interface DashbardConfig {
  columns: number;
}

export interface DashboardLinkConfig {
  name: string;
  title: string;
}

export interface DashboardConfig extends DashboardLinkConfig {
  slot: string;
  config: DashbardConfig;
}
