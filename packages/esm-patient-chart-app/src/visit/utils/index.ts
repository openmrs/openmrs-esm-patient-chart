export default function getUniqueFormNames(jsonData) {
  const formDict = {};

  jsonData.encounters.forEach((encounter) => {
    const formUuid = encounter?.form?.uuid;
    const formName = encounter?.form?.name;
    const uniqueIdentifier = `${formUuid}-${formName}`;
    formDict[uniqueIdentifier] = { uuid: formUuid, name: formName };
  });

  return Object.values(formDict);
}
