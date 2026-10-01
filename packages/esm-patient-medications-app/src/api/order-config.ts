import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import {
  type DosingUnit,
  type DurationUnit,
  type MedicationFrequency,
  type MedicationRoute,
  type QuantityUnit,
} from '@openmrs/esm-patient-common-lib';

export interface ConceptName {
  uuid: string;
  display: string;
}

interface ConceptMapping {
  conceptMapType?: { uuid?: string };
  conceptReferenceTerm?: {
    code?: string;
    conceptSource?: { hl7Code?: string };
  };
}

export interface CommonConfigProps {
  uuid: string;
  display: string;
  frequencyPerDay?: number;
  mappings?: Array<ConceptMapping>;
  concept?: {
    names: ConceptName[];
  };
}

export interface OrderConfig {
  drugRoutes: Array<CommonConfigProps>;
  drugDosingUnits: Array<CommonConfigProps>;
  drugDispensingUnits: Array<CommonConfigProps>;
  durationUnits: Array<CommonConfigProps>;
  orderFrequencies: Array<CommonConfigProps>;
}

export const SNOMED_CT_DAYS_CODE = '258703001';

export function findDaysDurationUnit(durationUnits: Array<CommonConfigProps> = []) {
  return durationUnits.find((unit) =>
    unit.mappings?.some(
      (mapping) =>
        mapping.conceptMapType?.uuid === '35543629-7d8c-11e1-909d-c80aa9edcf4e' &&
        mapping.conceptReferenceTerm?.conceptSource?.hl7Code === 'SCT' &&
        mapping.conceptReferenceTerm?.code === SNOMED_CT_DAYS_CODE,
    ),
  );
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
    daysDurationUnit?: CommonConfigProps;
  };
} {
  const { data, error, isLoading } = useSWRImmutable<{ data: OrderConfig }, Error>(
    `${restBaseUrl}/orderentryconfig?v=custom:(uuid,display,mappings:(conceptMapType:(uuid),conceptReferenceTerm:(code,conceptSource:(hl7Code))))`,
    openmrsFetch,
  );
  const {
    data: frequencyData,
    error: frequencyError,
    isLoading: frequencyLoading,
  } = useSWRImmutable<{ data: OrderConfig }, Error>(
    `${restBaseUrl}/orderentryconfig?v=custom:(uuid,display,frequencyPerDay,concept:(names:(display,uuid)))`,
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
        orderFrequencies: frequencyData?.data?.orderFrequencies?.map(({ uuid, display, frequencyPerDay, concept }) => ({
          valueCoded: uuid,
          value: display,
          frequencyPerDay: frequencyPerDay ?? null,
          names: concept.names.map((name) => name.display),
        })),
        daysDurationUnit: findDaysDurationUnit(data?.data?.durationUnits),
      },
      isLoading: isLoading || frequencyLoading,
      error: error || frequencyError,
    }),
    [data, error, isLoading, frequencyData, frequencyError, frequencyLoading],
  );
  return results;
}
