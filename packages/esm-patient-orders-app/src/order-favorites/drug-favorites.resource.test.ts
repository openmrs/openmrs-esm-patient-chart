import type { DrugFavoriteOrder } from './types';
import { vi, describe, it, expect } from 'vitest';
import { getLoggedInUser, type LoggedInUser, setUserProperties } from '@openmrs/esm-framework';
import { addDrugFavorite, removeDrugFavorite, updateUserProperty } from './drug-favorites.resource';

vi.mock('@openmrs/esm-framework', async (importOriginal) => ({
  ...(await importOriginal()),
  getLoggedInUser: vi.fn(),
}));

const makeFavorite = (overrides: Partial<DrugFavoriteOrder> = {}): DrugFavoriteOrder =>
  ({
    id: 'fav-1',
    drugUuid: 'drug-1',
    displayName: 'Aspirin 81mg',
    attributes: {},
    ...overrides,
  }) as DrugFavoriteOrder;

describe('addDrugFavorite', () => {
  it('appends a new favorite', () => {
    const existing = [makeFavorite({ id: 'fav-1' })];
    const newFav = makeFavorite({ id: 'fav-2', drugUuid: 'drug-2', displayName: 'Ibuprofen' });
    const result = addDrugFavorite(existing, newFav);
    expect(result).toHaveLength(2);
    expect(result[1].id).toBe('fav-2');
  });

  it('updates an existing favorite by id', () => {
    const existing = [makeFavorite({ id: 'fav-1', displayName: 'Old name' })];
    const updated = makeFavorite({ id: 'fav-1', displayName: 'New name' });
    const result = addDrugFavorite(existing, updated);
    expect(result).toHaveLength(1);
    expect(result[0].displayName).toBe('New name');
  });
});

describe('removeDrugFavorite', () => {
  it('removes by id', () => {
    const favorites = [makeFavorite({ id: 'fav-1' }), makeFavorite({ id: 'fav-2' })];
    const result = removeDrugFavorite(favorites, 'fav-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('fav-2');
  });

  it('returns same list when id not found', () => {
    const favorites = [makeFavorite({ id: 'fav-1' })];
    const result = removeDrugFavorite(favorites, 'nonexistent');
    expect(result).toHaveLength(1);
  });
});

describe('updateUserProperty', () => {
  it('keeps both values when two different properties are saved at the same time', async () => {
    // Mimics the session store: setUserProperties replaces the whole map, then the session is refetched
    let storedProperties: Record<string, string> = { defaultLocale: 'en' };
    vi.mocked(getLoggedInUser).mockImplementation(async () => ({ userProperties: storedProperties }) as LoggedInUser);
    vi.mocked(setUserProperties).mockImplementation(async (_userUuid, userProperties) => {
      await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));
      storedProperties = userProperties;
      return undefined;
    });

    await Promise.all([
      updateUserProperty('user-uuid', 'first', 'one'),
      updateUserProperty('user-uuid', 'second', 'two'),
    ]);

    expect(storedProperties).toEqual({ defaultLocale: 'en', first: 'one', second: 'two' });
  });

  it('still runs later writes after a failed write', async () => {
    vi.mocked(getLoggedInUser).mockResolvedValue({ userProperties: {} } as LoggedInUser);
    vi.mocked(setUserProperties).mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce(undefined);

    await expect(updateUserProperty('user-uuid', 'first', 'one')).rejects.toThrow('Network error');
    await expect(updateUserProperty('user-uuid', 'second', 'two')).resolves.toBeUndefined();
  });
});
