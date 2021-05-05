export const spaRoot = window['getOpenmrsSpaBase']();
export const basePath = '/patient/:patientUuid/chart';
export const dashboardPath = `${basePath}/:view?/:subview?`;
export const spaBasePath = `${window.spaBase}${basePath}`;
export const moduleName = '@openmrs/esm-patient-chart-app';
export const patientChartWorkspaceSlot = 'patient-chart-workspace-slot';
