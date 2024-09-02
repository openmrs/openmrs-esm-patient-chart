import { restBaseUrl } from '@openmrs/esm-framework';

export const customFormRepresentation =
  '(uuid,name,display,encounterType:(uuid,name,viewPrivilege,editPrivilege),version,published,retired,resources:(uuid,name,dataType,valueReference))';
export const customEncounterRepresentation = `custom:(uuid,encounterDatetime,encounterType:(uuid,name,viewPrivilege,editPrivilege),form:${customFormRepresentation}`;

export const formEncounterUrl = `${restBaseUrl}/form?v=custom:${customFormRepresentation}`;
export const formEncounterUrlPoc = `${restBaseUrl}/form?v=custom:${customFormRepresentation}&q=poc`;

export const clinicalFormsWorkspace = 'clinical-forms-workspace';
export const formEntryWorkspace = 'patient-form-entry-workspace';
export const spaRoot = window['getOpenmrsSpaBase']();
export const basePath = '/patient/:patientUuid/chart';
export const dashboardPath = `${basePath}/:view/*`;
export const spaBasePath = `${window.spaBase}${basePath}`;
export const moduleName = '@openmrs/esm-patient-chart-app';
export const patientChartWorkspaceSlot = 'patient-chart-workspace-slot';
export const patientChartWorkspaceHeaderSlot = 'patient-chart-workspace-header-slot';
export const omrsDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
