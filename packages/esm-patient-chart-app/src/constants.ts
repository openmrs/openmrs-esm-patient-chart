export const spaRoot = window["getOpenmrsSpaBase"]();
export const basePath = "/patient/:patientUuid/chart";
export const dashboardPath = `${basePath}/:view?/:subview?`;
export const spaBasePath = `${window.spaBase}${basePath}`;
