import { useMemo } from 'react';
import { usePrimaryIdentifierCode } from '@openmrs/esm-framework';

/**
 * Returns the patient's preferred identifier value (the one matching the configured
 * primary identifier type), falling back to the patient's first identifier. Returns
 * `undefined` until the patient and/or the primary identifier code has loaded.
 */
export function usePatientIdentifier(patient?: fhir.Patient) {
  const primaryIdentifierCode = usePrimaryIdentifierCode()?.primaryIdentifierCode;

  return useMemo(() => {
    if (!patient?.identifier?.length) {
      return undefined;
    }

    const preferredIdentifier = patient.identifier.find(
      (identifier) => identifier.type?.coding?.[0]?.code === primaryIdentifierCode,
    );

    return (preferredIdentifier ?? patient.identifier[0])?.value;
  }, [patient?.identifier, primaryIdentifierCode]);
}
