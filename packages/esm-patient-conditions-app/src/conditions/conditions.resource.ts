import useSWR from 'swr';
import { fhirBaseUrl, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { type FHIRCondition, type FHIRConditionResponse } from '../types';

export type Condition = {
  clinicalStatus: string;
  conceptId: string;
  display: string;
  onsetDateTime: string;
  recordedDate: string;
  id: string;
};

export interface ConditionDataTableRow {
  cells: Array<{
    id: string;
    value: string;
    info: {
      header: string;
    };
  }>;
  id: string;
}

export type CodedCondition = {
  concept: {
    uuid: string;
    display: string;
  };
  conceptName: {
    uuid: string;
    display: string;
  };
  display: string;
};

type CreatePayload = {
  clinicalStatus: {
    coding: [
      {
        system: string;
        code: string;
      },
    ];
  };
  code: {
    coding: [
      {
        code: string;
        display: string;
      },
    ];
  };
  endDate: string;
  onsetDateTime: string;
  recorder: {
    reference: string;
  };
  recordedDate: string;
  resourceType: string;
  subject: {
    reference: string;
  };
};

type EditPayload = CreatePayload & {
  id: string;
};

export type FormFields = {
  clinicalStatus: string;
  conceptId: string;
  display: string;
  endDate: string;
  onsetDateTime: string;
  patientId: string;
  userId: string;
};

export function useConditions(patientUuid: string) {
  const conditionsUrl = `${fhirBaseUrl}/Condition?patient=${patientUuid}&_count=100`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: FHIRConditionResponse }, Error>(
    patientUuid ? conditionsUrl : null,
    openmrsFetch,
  );

  const formattedConditions =
    data?.data?.total > 0
      ? data?.data?.entry
          .map((entry) => entry.resource ?? [])
          .map(mapConditionProperties)
          .sort((a, b) => (b.onsetDateTime > a.onsetDateTime ? 1 : -1))
      : null;

  return {
    conditions: data ? formattedConditions : null,
    isError: error,
    isLoading,
    isValidating,
    mutate,
  };
}

export function useConditionsSearch(conditionToLookup: string) {
  const config = useConfig();
  const conditionConceptClassUuid = config?.conditionConceptClassUuid;

  const conditionsSearchUrl = `${restBaseUrl}/conceptsearch?conceptClasses=${conditionConceptClassUuid}&q=${conditionToLookup}`;

  const { data, error, isLoading } = useSWR<{ data: { results: Array<CodedCondition> } }, Error>(
    conditionToLookup ? conditionsSearchUrl : null,
    openmrsFetch,
  );

  return {
    searchResults: data?.data?.results ?? [],
    error: error,
    isSearching: isLoading,
  };
}

function mapConditionProperties(condition: FHIRCondition): Condition {
  const status = condition?.clinicalStatus?.coding[0]?.code;
  return {
    clinicalStatus: status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '',
    conceptId: condition?.code?.coding[0]?.code,
    display: condition?.code?.coding[0]?.display,
    onsetDateTime: condition?.onsetDateTime,
    recordedDate: condition?.recordedDate,
    id: condition?.id,
  };
}

export async function createCondition(payload: FormFields) {
  const controller = new AbortController();
  const url = `${fhirBaseUrl}/Condition`;

  const completePayload: CreatePayload = {
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: payload.clinicalStatus,
        },
      ],
    },
    code: {
      coding: [
        {
          code: payload.conceptId,
          display: payload.display,
        },
      ],
    },
    endDate: payload.endDate,
    onsetDateTime: payload.onsetDateTime,
    recorder: {
      reference: `Practitioner/${payload.userId}`,
    },
    recordedDate: new Date().toISOString(),
    resourceType: 'Condition',
    subject: {
      reference: `Patient/${payload.patientId}`,
    },
  };

  const res = await openmrsFetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: completePayload,
    signal: controller.signal,
  });

  return res;
}

export async function updateCondition(conditionId, payload: FormFields) {
  const controller = new AbortController();
  const url = `${fhirBaseUrl}/Condition/${conditionId}`;

  const completePayload: EditPayload = {
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: payload.clinicalStatus,
        },
      ],
    },
    code: {
      coding: [
        {
          code: payload.conceptId,
          display: payload.display,
        },
      ],
    },
    endDate: payload.endDate,
    id: conditionId,
    onsetDateTime: payload.onsetDateTime,
    recorder: {
      reference: `Practitioner/${payload.userId}`,
    },
    recordedDate: new Date().toISOString(),
    resourceType: 'Condition',
    subject: {
      reference: `Patient/${payload.patientId}`,
    },
  };

  const res = await openmrsFetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'PUT',
    body: completePayload,
    signal: controller.signal,
  });

  return res;
}

export async function deleteCondition(conditionId: string) {
  const controller = new AbortController();
  const url = `${fhirBaseUrl}/Condition/${conditionId}`;

  const res = await openmrsFetch(url, {
    method: 'DELETE',
    signal: controller.signal,
  });

  return res;
}
