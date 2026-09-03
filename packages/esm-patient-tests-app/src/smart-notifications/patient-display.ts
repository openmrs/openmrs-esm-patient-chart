/**
 * The patient's preferred identifier, falling back to the first one present. FHIR marks the
 * preferred identifier with `use: 'official'`; non-preferred ones are `usual`.
 */
export function getPreferredIdentifier(
  patient: fhir.Patient | undefined | null,
): { label: string; value: string } | undefined {
  const identifiers = patient?.identifier;
  if (!identifiers?.length) {
    return undefined;
  }
  const identifier = identifiers.find((id) => id.use === 'official') ?? identifiers[0];
  return {
    label: identifier.type?.text ?? identifier.system ?? '',
    value: identifier.value ?? '',
  };
}
