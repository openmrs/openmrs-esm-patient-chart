import { getPatientName } from '@openmrs/esm-framework';

/** Two-letter monogram for the avatar tile, e.g. "Betty Bliss" -> "BB". */
export function getInitials(patient: fhir.Patient | undefined | null): string {
  if (!patient) {
    return '';
  }
  const name = getPatientName(patient) ?? '';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * The patient's preferred identifier, falling back to the first one present. FHIR marks the
 * preferred identifier with `use: 'usual'`.
 */
export function getPreferredIdentifier(
  patient: fhir.Patient | undefined | null,
): { label: string; value: string } | undefined {
  const identifiers = patient?.identifier;
  if (!identifiers?.length) {
    return undefined;
  }
  const identifier = identifiers.find((id) => id.use === 'usual') ?? identifiers[0];
  return {
    label: identifier.type?.text ?? identifier.system ?? '',
    value: identifier.value ?? '',
  };
}
