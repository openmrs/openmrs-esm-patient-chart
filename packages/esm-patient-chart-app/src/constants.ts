export const clinicalFormsWorkspace = 'clinical-forms-workspace';
export const formEntryWorkspace = 'patient-form-entry-workspace';
/**
 * Value passed as the `openedFrom` prop by the retrospective data entry (RDE) page. Components that
 * can be mounted both in the chart and in RDE branch on this to launch the RDE-scoped workspaces
 * instead of the chart's own.
 */
export const rdeOpenedFrom = 'RDE';
/**
 * The RDE page's own copy of the `encounter-workspace`, in the `rde-group` workspace group. This name
 * must match the `workspaces2` entry registered in `routes.json`.
 */
export const rdeEncounterWorkspace = 'rde-encounter-workspace';
export const spaRoot = window['getOpenmrsSpaBase']();
export const basePath = '/patient/:patientUuid/chart';
export const dashboardPath = `${basePath}/:view/*`;
export const rdePath = '/patient/:patientUuid/rde';
export const spaBasePath = `${window.spaBase}${basePath}`;
export const moduleName = '@openmrs/esm-patient-chart-app';
export const patientChartWorkspaceSlot = 'patient-chart-workspace-slot';
export const patientChartWorkspaceHeaderSlot = 'patient-chart-workspace-header-slot';
export const omrsDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
export const jsonSchemaResourceName = 'JSON schema';
