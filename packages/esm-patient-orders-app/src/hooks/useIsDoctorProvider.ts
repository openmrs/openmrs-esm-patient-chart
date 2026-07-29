import { useMemo } from 'react';
import { openmrsFetch, restBaseUrl, useSession } from '@openmrs/esm-framework';
import useSWR from 'swr';

interface ProviderWithAttributes {
  uuid: string;
  attributes?: Array<{
    attributeType?: { display: string };
    value?: string;
  }>;
}

/**
 * Determines whether the currently logged-in provider is a doctor
 * by checking the `practitioner_type` provider attribute.
 *
 * Returns `undefined` while loading, `true` if the current provider
 * is a doctor, and `false` otherwise.
 */
export function useIsDoctorProvider(): { isDoctor: boolean | undefined; isLoading: boolean } {
  const { currentProvider } = useSession();

  const { data: doctors, isLoading } = useSWR<ProviderWithAttributes[]>(
    `${restBaseUrl}/provider?v=custom:(uuid,display,person:(display),attributes:(attributeType:(display),value))`,
    (url: string) =>
      openmrsFetch(url).then((res) =>
        res.data.results.filter((provider: ProviderWithAttributes) =>
          provider.attributes?.some(
            (attr) =>
              attr.attributeType?.display === 'practitioner_type' && attr.value?.toLowerCase() === 'doctor',
          ),
        ),
      ),
  );

  const isDoctor = useMemo(() => {
    if (!doctors) return undefined;
    return doctors.some((provider) => provider.uuid === currentProvider?.uuid);
  }, [doctors, currentProvider]);

  return { isDoctor, isLoading };
}
