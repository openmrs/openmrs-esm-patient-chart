import { type OpenmrsResource } from '@openmrs/esm-framework';

export * from './test-results';

export interface DashboardLinkConfig {
  path: string;
  title: string;
  moduleName: string;
}

export interface DashboardConfig extends DashboardLinkConfig {
  slot: string;
}

export interface PatientProgram {
  uuid: string;
  patient?: DisplayMetadata;
  program: {
    uuid: string;
    name: string;
    allWorkflows: Array<{
      uuid: string;
      concept: DisplayMetadata;
      retired: boolean;
      states: Array<Record<string, unknown>>;
      links?: Links;
    }>;
    concept: DisplayMetadata;
    links: Links;
  };
  display: string;
  dateEnrolled: string;
  dateCompleted: string | null;
  location?: DisplayMetadata;
  voided?: boolean;
  outcome?: null;
  states?: [];
  links: Links;
  resourceVersion?: string;
}

export type Links = Array<{
  rel: string;
  uri: string;
}>;

export interface DisplayMetadata {
  display: string;
  links: Links;
  uuid: string;
}
