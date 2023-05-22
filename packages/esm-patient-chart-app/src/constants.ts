export const spaRoot = window['getOpenmrsSpaBase']();
export const basePath = '/patient/:patientUuid/chart';
export const dashboardPath = `${basePath}/:view/*`;
export const spaBasePath = `${window.spaBase}${basePath}`;
export const moduleName = '@openmrs/esm-patient-chart-app';
export const patientChartWorkspaceSlot = 'patient-chart-workspace-slot';
export const patientChartWorkspaceHeaderSlot = 'patient-chart-workspace-header-slot';

export const STATUS = {
  WAITING: 'waiting',
  IN_SERVICE: 'in service',
  FINISHED_SERVICE: 'finished service',
};

export const PRIORITY = {
  EMERGENCY: 'emergency',
  NOT_URGENT: 'not urgent',
};
