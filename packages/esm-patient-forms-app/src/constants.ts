export const customFormRepresentation =
  '(uuid,name,display,encounterType:(uuid,name,viewPrivilege,editPrivilege),version,published,retired,resources:(uuid,name,dataType,valueReference))';
export const customEncounterRepresentation = `custom:(uuid,encounterDatetime,encounterType:(uuid,name,viewPrivilege,editPrivilege),form:${customFormRepresentation}`;

export const formEncounterUrl = `/ws/rest/v1/form?v=custom:${customFormRepresentation}`;
export const formEncounterUrlPoc = `/ws/rest/v1/form?v=custom:${customFormRepresentation}&q=poc`;
