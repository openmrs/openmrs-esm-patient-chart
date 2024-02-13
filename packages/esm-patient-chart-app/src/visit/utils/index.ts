export default function getUniqueFormNames(jsonData) {
  const formDict = {};

  jsonData.encounters.forEach((encounter) => {
    const formUuid = encounter?.encounterType?.uuid;
    const formName = encounter?.encounterType?.display;
    const uniqueIdentifier = `${formUuid}-${formName}`;
    formDict[uniqueIdentifier] = { uuid: formUuid, name: formName };
  });

  return Object.values(formDict);
}
