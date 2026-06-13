export function getIncludedPatientIdentifierValues(
  patient: fhir.Patient | null | undefined,
  excludedIdentifierCodes: Array<string> = [],
): Array<string> {
  return (
    patient?.identifier?.reduce<Array<string>>((values, identifier) => {
      const identifierValue = identifier?.value?.trim();
      const identifierCode = identifier?.type?.coding?.[0]?.code;

      if (!identifierValue || (identifierCode && excludedIdentifierCodes.includes(identifierCode))) {
        return values;
      }

      values.push(identifierValue);
      return values;
    }, []) ?? []
  );
}
