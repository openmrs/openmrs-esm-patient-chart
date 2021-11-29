export const customFormRepresentation =
  '(uuid,name,encounterType:(uuid,name),version,published,retired,resources:(uuid,name,dataType,valueReference))';
export const customEncounterRepresentation = `custom:(uuid,encounterDatetime,encounterType:(uuid,name),form:${customFormRepresentation}`;

export const formEncounterUrl = `/ws/rest/v1/form?v=custom:${customFormRepresentation}`;
