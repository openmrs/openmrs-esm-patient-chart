/**
 * Mock for @openmrs/esm-patient-common-lib used in tests.
 * This prevents the Angular test compiler from trying to compile the React-based common lib.
 */

export interface Form {
  uuid: string;
  encounterType?: { uuid: string; name: string; display: string };
  name: string;
  display?: string;
  version: string;
  published: boolean;
  retired: boolean;
  resources: Array<{ uuid: string; name: string; dataType: string; valueReference: string }>;
}
