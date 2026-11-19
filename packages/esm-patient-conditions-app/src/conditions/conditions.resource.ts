import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { type DataTableSortState } from '@carbon/react';
import { fhirBaseUrl, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';

export interface FHIRConditionResponse {
  entry: Array<{
    resource: FHIRCondition;
  }>;
  id: string;
  meta: {
    lastUpdated: string;
  };
  resourceType: string;
  total: number;
  type: string;
}

export interface FHIRCondition {
  clinicalStatus: {
    coding: Array<CodingData>;
    display: string;
  };
  code: {
    coding: Array<CodingData>;
  };
  id: string;
  onsetDateTime: string;
  recordedDate: string;
  recorder: {
    display: string;
    reference: string;
    type: string;
  };
  resourceType: string;
  subject: {
    display: string;
    reference: string;
    type: string;
  };
  text: {
    div: string;
    status: string;
  };
  abatementDateTime?: string;
}

interface CodingData {
  code: string;
  display: string;
  extension?: Array<ExtensionData>;
  system?: string;
}

interface ExtensionData {
  extension: [];
  url: string;
}

export type Condition = {
  clinicalStatus: string;
  conceptId: string;
  display: string;
  onsetDateTime: string;
  recordedDate: string;
  id: string;
  abatementDateTime?: string;
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
  display: string;
  uuid: string;
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
  onsetDateTime: string;
  recorder: {
    reference: string;
  };
  recordedDate: string;
  resourceType: string;
  subject: {
    reference: string;
  };
  abatementDateTime?: string;
};

type EditPayload = CreatePayload & {
  id: string;
};

export type FormFields = {
  clinicalStatus: string;
  conceptId: string;
  display: string;
  abatementDateTime: string;
  onsetDateTime: string;
  patientId: string;
  userId: string;
};

export function useConditions(patientUuid: string) {
  const conditionsCategory = 'http://terminology.hl7.org/CodeSystem/condition-category|problem-list-item';
  const conditionsUrl = `${fhirBaseUrl}/Condition?patient=${patientUuid}&category=${conditionsCategory}&_count=100`;
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
    error: error,
    isLoading,
    isValidating,
    mutate,
  };
}

interface ConceptSetMember {
  uuid: string;
  display: string;
  names?: Array<{ display: string }>;
}

interface ConceptSetResponse {
  uuid: string;
  setMembers?: Array<ConceptSetMember>;
}

const conceptSetMembersRepresentation = 'custom:(uuid,setMembers:(uuid,display,names:(display)))';

function normalizeSearchText(text: string) {
  return (text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim();
}

/**
 * Loads the members of the configured condition concept sets once, de-duplicated by UUID.
 */
function useConditionConceptSetMembers(conceptSetUuids: Array<string>) {
  const { data, error, isLoading } = useSWRImmutable<Array<ConceptSetMember>, Error>(
    conceptSetUuids?.length ? ['conditionConceptSets', ...conceptSetUuids] : null,
    async ([, ...uuids]: Array<string>) => {
      const responses = await Promise.all(
        uuids.map((uuid) =>
          openmrsFetch<ConceptSetResponse>(`${restBaseUrl}/concept/${uuid}?v=${conceptSetMembersRepresentation}`),
        ),
      );
      const membersByUuid = new Map<string, ConceptSetMember>();
      responses.forEach((response) =>
        (response?.data?.setMembers ?? []).forEach((member) => {
          if (member?.uuid && !membersByUuid.has(member.uuid)) {
            membersByUuid.set(member.uuid, member);
          }
        }),
      );
      return Array.from(membersByUuid.values());
    },
  );

  return { members: data, error, isLoading };
}

/**
 * Returns the set members whose display name or any other name contains every word of the search term,
 * ignoring case and accents. Members whose display name starts with the search term are listed first.
 */
export function filterConditionConceptSetMembers(
  members: Array<ConceptSetMember>,
  searchTerm: string,
): Array<CodedCondition> {
  const normalizedTerm = normalizeSearchText(searchTerm);
  if (!normalizedTerm || !members?.length) {
    return [];
  }
  const words = normalizedTerm.split(/\s+/);

  return members
    .map((member) => ({
      member,
      display: normalizeSearchText(member.display),
      names: [member.display, ...(member.names ?? []).map((name) => name.display)].map(normalizeSearchText),
    }))
    .filter(({ names }) => names.some((name) => words.every((word) => name.includes(word))))
    .sort((a, b) => {
      const aStarts = a.display.startsWith(normalizedTerm) ? 0 : 1;
      const bStarts = b.display.startsWith(normalizedTerm) ? 0 : 1;
      return aStarts - bStarts || a.display.localeCompare(b.display);
    })
    .map(({ member }) => ({ uuid: member.uuid, display: member.display }));
}

export function useConditionsSearch(conditionToLookup: string) {
  const config = useConfig<ConfigObject>();
  const conditionConceptClassUuid = config?.conditionConceptClassUuid;
  const conditionConceptSets = config?.conditionConceptSets ?? [];
  const searchByConceptSets = conditionConceptSets.length > 0;

  const conditionsSearchUrl = `${restBaseUrl}/concept?name=${conditionToLookup}&searchType=fuzzy&class=${conditionConceptClassUuid}&v=custom:(uuid,display)`;

  const { data, error, isLoading } = useSWR<{ data: { results: Array<CodedCondition> } }, Error>(
    conditionToLookup && !searchByConceptSets ? conditionsSearchUrl : null,
    openmrsFetch,
  );

  const {
    members,
    error: conceptSetError,
    isLoading: isLoadingConceptSets,
  } = useConditionConceptSetMembers(searchByConceptSets ? conditionConceptSets : null);

  const conceptSetResults = useMemo(
    () => (searchByConceptSets ? filterConditionConceptSetMembers(members, conditionToLookup) : []),
    [searchByConceptSets, members, conditionToLookup],
  );

  if (searchByConceptSets) {
    return {
      searchResults: conceptSetResults,
      error: conceptSetError,
      isSearching: Boolean(conditionToLookup) && isLoadingConceptSets,
    };
  }

  return {
    searchResults: data?.data?.results ?? [],
    error,
    isSearching: isLoading,
  };
}

function mapConditionProperties(condition: FHIRCondition): Condition {
  const status = condition?.clinicalStatus?.coding[0]?.code;
  return {
    clinicalStatus: status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '',
    conceptId: condition?.code?.coding[0]?.code,
    display: condition?.code?.coding[0]?.display,
    abatementDateTime: condition?.abatementDateTime,
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
    abatementDateTime: payload.abatementDateTime,
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
    abatementDateTime: payload.abatementDateTime,
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

export interface ConditionTableRow extends Condition {
  id: string;
  condition: string;
  abatementDateTime: string;
  onsetDateTimeRender: string;
}

export type ConditionSortValue = string | number | null | undefined;

export interface ConditionTableHeader<TableRow = ConditionTableRow> {
  key: 'display' | 'onsetDateTimeRender' | 'status';
  header: string;
  isSortable: true;
  /** The value a row is sorted by. Rows without a value always sort last. */
  sortValue: (row: TableRow) => ConditionSortValue;
}

/** Returns an onset date as a timestamp to sort by, or `null` when the condition has none. */
export function getOnsetSortValue(onsetDateTime: string | undefined): number | null {
  const timestamp = onsetDateTime ? Date.parse(onsetDateTime) : NaN;
  return Number.isNaN(timestamp) ? null : timestamp;
}

/**
 * Compares two sort values in the given direction. A missing value always sorts after
 * a present one, whichever the direction, so conditions without a value (such as an
 * onset date) stay at the bottom of the table instead of breaking up the sorted ones.
 */
function compareSortValues(a: ConditionSortValue, b: ConditionSortValue, direction: 1 | -1) {
  const isMissingA = a == null || a === '';
  const isMissingB = b == null || b === '';

  if (isMissingA !== isMissingB) {
    return isMissingA ? 1 : -1;
  }

  if (isMissingA) {
    return 0;
  }

  const result = typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b));
  return result * direction;
}

/**
 * Carbon only ever sorts the rows it was handed, which is a single page. Pass this as
 * the table's `sortRow` to keep its comparator inert so that the hook can sort the
 * full dataset instead.
 */
export const noopSortRow = () => 0;

/**
 * Sorts the conditions table's full dataset in the direction shown by the header's
 * sort arrow.
 *
 * The sort state is read from the header's click handler, which Carbon calls exactly
 * once per click with the state it is transitioning to. Carbon's `sortRow` is not
 * used for this because it is skipped when a header returns to `NONE` and is never
 * called when the page holds a single row.
 */
export function useConditionsSorting<TableRow>(
  tableHeaders: Array<ConditionTableHeader<TableRow>>,
  tableRows: Array<TableRow>,
) {
  const [sortParams, setSortParams] = useState<{
    key: ConditionTableHeader['key'] | '';
    sortDirection: DataTableSortState;
  }>({ key: '', sortDirection: 'NONE' });

  const handleSortHeaderClick = useCallback(
    (
      _event: unknown,
      { sortHeaderKey, sortDirection }: { sortHeaderKey: string; sortDirection: DataTableSortState },
    ) => {
      setSortParams({
        key: sortDirection === 'NONE' ? '' : (sortHeaderKey as ConditionTableHeader['key']),
        sortDirection,
      });
    },
    [],
  );

  const sortedRows = useMemo(() => {
    if (sortParams.sortDirection === 'NONE') {
      return tableRows;
    }

    const tableHeader = tableHeaders.find((header) => header.key === sortParams.key);

    if (!tableHeader) {
      return tableRows;
    }

    const direction = sortParams.sortDirection === 'DESC' ? -1 : 1;
    return tableRows
      ?.slice()
      .sort((rowA, rowB) => compareSortValues(tableHeader.sortValue(rowA), tableHeader.sortValue(rowB), direction));
  }, [sortParams, tableRows, tableHeaders]);

  return {
    sortedRows,
    handleSortHeaderClick,
  };
}
