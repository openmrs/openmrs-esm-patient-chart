import { createElement, type ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { openmrsFetch, type Session, useSession } from '@openmrs/esm-framework';
import { FAVORITES_PROPERTY_KEY, saveDrugFavorites, updateUserProperty } from './drug-favorites.resource';
import { useDismissedSuggestions } from './useDismissedSuggestions';
import { useFavoritesActions } from './useFavoritesActions';
import type { DrugFavoriteOrder } from './types';

vi.mock('./drug-favorites.resource', async (importOriginal) => ({
  ...(await importOriginal()),
  saveDrugFavorites: vi.fn(),
  updateUserProperty: vi.fn(),
}));

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map(), dedupingInterval: 0 } }, children);

const makeFavorite = (drugUuid: string): DrugFavoriteOrder => ({
  id: `favorite-${drugUuid}`,
  drugUuid,
  displayName: drugUuid,
  attributes: {},
});

function mockServerFavorites(getFavorites: () => Array<DrugFavoriteOrder>) {
  vi.mocked(useSession).mockReturnValue({ user: { uuid: 'user-uuid' } } as Session);
  vi.mocked(openmrsFetch).mockImplementation(
    async () =>
      ({
        data: {
          uuid: 'user-uuid',
          userProperties: { [FAVORITES_PROPERTY_KEY]: JSON.stringify({ favorites: getFavorites() }) },
        },
      }) as never,
  );
}

describe('useFavoritesActions', () => {
  it('does not restore a removed favorite while a later save is still pending', async () => {
    const aspirin = makeFavorite('aspirin');
    const metformin = makeFavorite('metformin');
    let serverFavorites = [aspirin, metformin];
    mockServerFavorites(() => serverFavorites);
    const pendingSaves: Array<() => void> = [];
    vi.mocked(saveDrugFavorites).mockImplementation(
      (_userUuid, favorites) =>
        new Promise((resolve) =>
          pendingSaves.push(() => {
            serverFavorites = favorites;
            resolve(undefined);
          }),
        ),
    );

    const { result } = renderHook(() => useFavoritesActions(), { wrapper });
    await waitFor(() => expect(result.current.favorites).toHaveLength(2));

    act(() => void result.current.deleteMultipleFavorites([aspirin]));
    act(() => void result.current.deleteMultipleFavorites([metformin]));
    expect(result.current.favorites).toEqual([]);

    await act(async () => pendingSaves[0]());
    expect(result.current.favorites).toEqual([]);

    await act(async () => pendingSaves[1]());
    await waitFor(() => expect(openmrsFetch).toHaveBeenCalledTimes(2));
    expect(result.current.favorites).toEqual([]);
  });

  it('keeps a pending pin when a suggestion is dismissed before the pin is saved', async () => {
    mockServerFavorites(() => []);
    vi.mocked(saveDrugFavorites).mockReturnValue(new Promise(() => {}));
    vi.mocked(updateUserProperty).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => ({ favorites: useFavoritesActions(), dismissed: useDismissedSuggestions() }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.favorites.isLoading).toBe(false));

    act(() => void result.current.favorites.persistFavorites([makeFavorite('aspirin')], {} as never));
    act(() => void result.current.dismissed.dismissSuggestion('metformin'));

    expect(result.current.favorites.favorites).toEqual([makeFavorite('aspirin')]);
    expect(result.current.dismissed.hiddenOrDismissedDrugUuids).toEqual(new Set(['metformin']));
  });
});
