import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, OpenmrsResource, Visit } from '@openmrs/esm-framework';

interface ProgramConfig {
  programUuid: Record<
    string,
    { name: string; dataDependencies: Array<string>; enrollmentAllowed: boolean; visitTypes: Array<OpenmrsResource> }
  >;
}

export const useProgramConfig = (patientUuid: string) => {
  const { data, error } = useSWR<{ data: ProgramConfig }>(
    `/etl-latest/etl/patient-program-config?patientUuid=${patientUuid}`,
    openmrsFetch,
  );

  const programConfigs = useMemo(() => data?.data ?? [], [data]);

  return { programConfigs, error };
};
