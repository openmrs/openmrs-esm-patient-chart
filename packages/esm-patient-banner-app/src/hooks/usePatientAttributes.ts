import { restBaseUrl, useConfig, useOpenmrsSWR } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import type { PersonAttributeResponse } from '../types';
import { useMemo } from 'react';

/**
 * React hook for obtaining patient attributes for a given patient {@link Attribute}
 *
 * If `patientUuid` is null, the hook does nothing.
 *
 * @param patientUuid The patient's UUID
 */
function usePersonAttributes(personUuid?: string | null, customRepresentation: string = null) {
  customRepresentation = customRepresentation || 'custom:(uuid,display,attributeType:(uuid,display,format),value)';
  const shouldFetch = !!personUuid;
  const { personAttributeTagsToDisplay } = useConfig<ConfigObject>();
  const { data, isLoading, error } = useOpenmrsSWR<{ results: Array<PersonAttributeResponse> }, Error>(
    shouldFetch ? `${restBaseUrl}/person/${personUuid}/attribute?v=${customRepresentation}` : null,
  );

  const results = useMemo(
    () => ({
      data:
        data?.data?.results.reduce((acc: Record<string, PersonAttributeResponse>, curr) => {
          if (personAttributeTagsToDisplay?.includes(curr.attributeType.uuid)) {
            acc[curr.attributeType.uuid] = curr;
          }
          return acc;
        }, {}) ?? {},
      isLoading,
      error,
    }),
    [data?.data?.results, personAttributeTagsToDisplay, isLoading, error],
  );

  return results;
}

export default usePersonAttributes;
