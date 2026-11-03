import { createElement, type ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { getGlobalStore, openmrsFetch, type Session, useSession } from '@openmrs/esm-framework';
import { updateUserProperty } from './drug-favorites.resource';
import {
  DISMISSED_SUGGESTIONS_PROPERTY_KEY,
  MAX_DISMISSED_SUGGESTIONS,
  parseDismissedDrugUuids,
  useDismissedSuggestions,
} from './useDismissedSuggestions';

vi.mock('./drug-favorites.resource', async (importOriginal) => ({
  ...(await importOriginal()),
  updateUserProperty: vi.fn(),
}));

// A fresh SWR cache per test, so stored dismissals don't leak between tests
const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map(), dedupingInterval: 0 } }, children);

const mockOpenmrsFetch = vi.mocked(openmrsFetch);
const mockUpdateUserProperty = vi.mocked(updateUserProperty);

function mockStoredDismissals(drugUuids: Array<string>) {
  mockOpenmrsFetch.mockResolvedValue({
    data: {
      uuid: 'user-uuid',
      userProperties: { [DISMISSED_SUGGESTIONS_PROPERTY_KEY]: JSON.stringify({ drugUuids }) },
    },
  } as never);
}

describe('useDismissedSuggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getGlobalStore('hidden-drug-order-suggestions').setState({ hiddenDrugUuids: [], isSwapPromptHidden: false });
    vi.mocked(useSession).mockReturnValue({ user: { uuid: 'user-uuid' } } as Session);
    mockUpdateUserProperty.mockResolvedValue(undefined);
  });

  it('excludes drugs dismissed permanently', async () => {
    mockStoredDismissals(['dismissed-drug']);

    const { result } = renderHook(() => useDismissedSuggestions(), { wrapper });

    await waitFor(() => expect(result.current.hiddenOrDismissedDrugUuids).toEqual(new Set(['dismissed-drug'])));
  });

  it('saves a permanent dismissal to the user properties', async () => {
    mockStoredDismissals(['dismissed-drug']);
    const { result } = renderHook(() => useDismissedSuggestions(), { wrapper });
    await waitFor(() => expect(result.current.hiddenOrDismissedDrugUuids.size).toBe(1));

    await act(() => result.current.dismissSuggestion('new-drug'));

    expect(mockUpdateUserProperty).toHaveBeenCalledWith(
      'user-uuid',
      DISMISSED_SUGGESTIONS_PROPERTY_KEY,
      JSON.stringify({ drugUuids: ['dismissed-drug', 'new-drug'] }),
    );
  });

  it('keeps only the most recent permanent dismissals', async () => {
    const stored = Array.from({ length: MAX_DISMISSED_SUGGESTIONS }, (_, index) => `drug-${index}`);
    mockStoredDismissals(stored);
    const { result } = renderHook(() => useDismissedSuggestions(), { wrapper });
    await waitFor(() => expect(result.current.hiddenOrDismissedDrugUuids.size).toBe(MAX_DISMISSED_SUGGESTIONS));

    await act(() => result.current.dismissSuggestion('new-drug'));

    const saved = JSON.parse(mockUpdateUserProperty.mock.calls[0][2]).drugUuids;
    expect(saved).toHaveLength(MAX_DISMISSED_SUGGESTIONS);
    expect(saved[0]).toBe('drug-1');
    expect(saved.at(-1)).toBe('new-drug');
  });

  it('hides a suggestion for now without saving it', async () => {
    mockStoredDismissals([]);
    const { result } = renderHook(() => useDismissedSuggestions(), { wrapper });

    act(() => result.current.hideSuggestion('hidden-drug'));

    expect(result.current.hiddenOrDismissedDrugUuids.has('hidden-drug')).toBe(true);
    expect(mockUpdateUserProperty).not.toHaveBeenCalled();
  });
});

describe('parseDismissedDrugUuids', () => {
  it('returns no dismissals for a missing or malformed value', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(parseDismissedDrugUuids(undefined)).toEqual([]);
    expect(parseDismissedDrugUuids('not json')).toEqual([]);
    expect(parseDismissedDrugUuids(JSON.stringify({ drugUuids: 'not-an-array' }))).toEqual([]);
  });
});
