import { type OpenmrsResource } from '@openmrs/esm-framework';

export * from './test-results';
export * from './workspace';

export interface DashbardConfig {
  columns: number;
}

export interface DashboardLinkConfig {
  path: string;
  title: string;
  moduleName: string;
}

export interface DashboardConfig extends DashboardLinkConfig {
  slot: string;
  config: DashbardConfig;
}

export interface PatientProgram {
  uuid: string;
  display: string;
  patient: OpenmrsResource;
  program: OpenmrsResource;
  dateEnrolled: string;
  dateCompleted: string;
  location: OpenmrsResource;
}
