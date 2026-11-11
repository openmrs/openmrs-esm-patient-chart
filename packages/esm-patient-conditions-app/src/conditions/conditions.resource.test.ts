import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { getDefaultsFromConfigSchema, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from '../config-schema';
import { filterConditionConceptSetMembers, useConditionsSearch } from './conditions.resource';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);
const mockUseConfig = vi.mocked(useConfig<ConfigObject>);

const conditionsSetUuid = 'c64140b1-6dec-477c-90ca-fc40c60e6cfd';
const otherSetUuid = '2b1f1a0e-0000-4000-8000-000000000001';

const malaria = { uuid: 'malaria-uuid', display: 'Malaria', names: [{ display: 'Malaria' }] };
const severeMalaria = {
  uuid: 'severe-malaria-uuid',
  display: 'Severe malaria',
  names: [{ display: 'Severe malaria' }, { display: 'Complicated malaria' }],
};
const anaemia = { uuid: 'anaemia-uuid', display: 'Anaemia', names: [{ display: 'Anemia' }] };
const pneumonia = { uuid: 'pneumonia-uuid', display: 'Pneumonia', names: [] };

function mockConfig(overrides: Partial<ConfigObject> = {}) {
  mockUseConfig.mockReturnValue({
    ...(getDefaultsFromConfigSchema(configSchema) as ConfigObject),
    ...overrides,
  });
}

describe('filterConditionConceptSetMembers', () => {
  const members = [severeMalaria, malaria, anaemia, pneumonia];

  it('returns nothing for an empty search term', () => {
    expect(filterConditionConceptSetMembers(members, '')).toEqual([]);
    expect(filterConditionConceptSetMembers(members, '   ')).toEqual([]);
  });

  it('matches case-insensitively and lists display names starting with the term first', () => {
    expect(filterConditionConceptSetMembers(members, 'MALARIA')).toEqual([
      { uuid: 'malaria-uuid', display: 'Malaria' },
      { uuid: 'severe-malaria-uuid', display: 'Severe malaria' },
    ]);
  });

  it('matches on other names of the concept', () => {
    expect(filterConditionConceptSetMembers(members, 'anemia')).toEqual([{ uuid: 'anaemia-uuid', display: 'Anaemia' }]);
    expect(filterConditionConceptSetMembers(members, 'complicated')).toEqual([
      { uuid: 'severe-malaria-uuid', display: 'Severe malaria' },
    ]);
  });

  it('requires every word of the term and ignores accents', () => {
    expect(filterConditionConceptSetMembers(members, 'malaria severe')).toEqual([
      { uuid: 'severe-malaria-uuid', display: 'Severe malaria' },
    ]);
    expect(filterConditionConceptSetMembers(members, 'pnéumonia')).toEqual([
      { uuid: 'pneumonia-uuid', display: 'Pneumonia' },
    ]);
  });
});

describe('useConditionsSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('searches by concept class when no concept sets are configured', async () => {
    mockConfig();
    mockOpenmrsFetch.mockResolvedValue({ data: { results: [{ uuid: 'malaria-uuid', display: 'Malaria' }] } } as any);

    const { result } = renderHook(() => useConditionsSearch('mal'));

    await waitFor(() => expect(result.current.searchResults).toHaveLength(1));
    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1);
    expect(mockOpenmrsFetch.mock.calls[0][0]).toContain(
      `${restBaseUrl}/concept?name=mal&searchType=fuzzy&class=8d4918b0-c2cc-11de-8d13-0010c6dffd0f`,
    );
  });

  it('offers only members of the configured concept sets, de-duplicated, without a class search', async () => {
    mockConfig({ conditionConceptSets: [conditionsSetUuid, otherSetUuid] });
    mockOpenmrsFetch.mockImplementation(((url: string) =>
      Promise.resolve({
        data: url.includes(conditionsSetUuid)
          ? { uuid: conditionsSetUuid, setMembers: [malaria, severeMalaria, anaemia] }
          : { uuid: otherSetUuid, setMembers: [malaria, pneumonia] },
      })) as any);

    const { result } = renderHook(() => useConditionsSearch('malaria'));

    await waitFor(() =>
      expect(result.current.searchResults).toEqual([
        { uuid: 'malaria-uuid', display: 'Malaria' },
        { uuid: 'severe-malaria-uuid', display: 'Severe malaria' },
      ]),
    );
    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(2);
    mockOpenmrsFetch.mock.calls.forEach(([url]) => {
      expect(url).toMatch(new RegExp(`${restBaseUrl}/concept/(${conditionsSetUuid}|${otherSetUuid})\\?v=custom:`));
      expect(url).not.toContain('searchType=fuzzy');
    });
  });

  it('returns no results for an empty search term when concept sets are configured', async () => {
    mockConfig({ conditionConceptSets: [conditionsSetUuid] });
    mockOpenmrsFetch.mockResolvedValue({ data: { uuid: conditionsSetUuid, setMembers: [malaria] } } as any);

    const { result } = renderHook(() => useConditionsSearch(''));

    expect(result.current.searchResults).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });
});
