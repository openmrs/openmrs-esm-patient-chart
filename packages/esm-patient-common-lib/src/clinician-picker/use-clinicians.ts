import { useMemo } from 'react';
import { restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';

export interface Provider {
  uuid: string;
  person: {
    display?: string;
  };
}

const providerRep = 'custom:(uuid,person:(display))';

/**
 * Fetches the providers that can be selected as the clinician of an encounter.
 *
 * @param providerRoles Limits the list to providers having one of these roles. An empty list means all providers.
 *   Pass `null` to skip fetching altogether.
 */
export function useClinicians(providerRoles: Array<string> | null) {
  const url =
    providerRoles === null
      ? null
      : providerRoles?.length
        ? `${restBaseUrl}/provider?providerRoles=${providerRoles.join(',')}&v=${providerRep}`
        : `${restBaseUrl}/provider?v=${providerRep}`;
  const { data, ...rest } = useOpenmrsFetchAll<Provider>(url);

  const providers = useMemo(
    () => data?.slice().sort((a, b) => (a.person?.display ?? '').localeCompare(b.person?.display ?? '')),
    [data],
  );

  return { providers, ...rest };
}
