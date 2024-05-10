import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import {
  type DosingUnit,
  type DurationUnit,
  type MedicationFrequency,
  type MedicationRoute,
  type QuantityUnit,
} from '../types';

export interface ConceptName {
  uuid: string;
  display: string;
}
export interface CommonConfigProps {
  uuid: string;
  display: string;
  concept?: {
    names: Names[];
  };
}

export interface OrderConfig {
  drugRoutes: Array<CommonConfigProps>;
  drugDosingUnits: Array<CommonConfigProps>;
  drugDispensingUnits: Array<CommonConfigProps>;
  durationUnits: Array<CommonConfigProps>;
  orderFrequencies: Array<CommonConfigProps>;
}

export function useOrderConfig(): {
  isLoading: boolean;
  error: Error;
  orderConfigObject: {
    drugRoutes: Array<MedicationRoute>;
    drugDosingUnits: Array<DosingUnit>;
    drugDispensingUnits: Array<QuantityUnit>;
    durationUnits: Array<DurationUnit>;
    orderFrequencies: Array<MedicationFrequency>;
  };
} {
  const { data, error, isLoading, isValidating } = useSWRImmutable<{ data: OrderConfig }, Error>(
    `${restBaseUrl}/orderentryconfig`,
    openmrsFetch,
  );
  const {
    data: frequencyData,
    error: frequencyError,
    isLoading: frequencyLoading,
  } = useSWRImmutable<{ data: OrderConfig }, Error>(
    `${restBaseUrl}/orderentryconfig?v=custom:(uuid,display,concept:(names:(display,uuid)))`,
    openmrsFetch,
  );

  const results = useMemo(
    () => ({
      orderConfigObject: {
        drugRoutes: data?.data?.drugRoutes?.map(({ uuid, display }) => ({
          valueCoded: uuid,
          value: display,
        })),
        drugDosingUnits: data?.data?.drugDosingUnits?.map(({ uuid, display }) => ({
          valueCoded: uuid,
          value: display,
        })),
        drugDispensingUnits: data?.data?.drugDispensingUnits?.map(({ uuid, display }) => ({
          valueCoded: uuid,
          value: display,
        })),
        durationUnits: data?.data?.durationUnits?.map(({ uuid, display }) => ({
          valueCoded: uuid,
          value: display,
        })),
        orderFrequencies: frequencyData?.data?.orderFrequencies?.map(({ uuid, display, concept }) => {
          return {
            valueCoded: uuid,
            value: display,
            names: concept.names.map((name) => name.display),
          };
        }),
      },
      isLoading: isLoading || frequencyLoading,
      error: error || frequencyError,
    }),
    [data, error, isLoading, frequencyData, frequencyError, frequencyLoading],
  );
  return results;
}
