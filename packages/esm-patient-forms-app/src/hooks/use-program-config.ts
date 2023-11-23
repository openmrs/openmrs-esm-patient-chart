import { useMemo } from 'react';
import useSWR from 'swr';
import { openmrsFetch, type OpenmrsResource, Visit } from '@openmrs/esm-framework';

interface ProgramConfigObj {
  name: string;
  dataDependencies: Array<string>;
  enrollmentAllowed: boolean;
  visitTypes: Array<OpenmrsResource>;
}

interface ProgramConfig {
  programUuid: Record<string, ProgramConfigObj>;
}

export const useProgramConfig = (patientUuid: string, loadProgramConfig: boolean = false) => {
  const { data, error, isLoading } = useSWR<{ data: ProgramConfig }>(
    loadProgramConfig && `/etl-latest/etl/patient-program-config?patientUuid=${patientUuid}`,
    openmrsFetch,
  );

  const programConfigs = useMemo(() => data?.data ?? [], [data]);

  return { programConfigs, error };
};
