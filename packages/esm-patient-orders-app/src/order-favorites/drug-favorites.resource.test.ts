import type { DrugFavoriteOrder } from './types';
import { addDrugFavorite, removeDrugFavorite } from './drug-favorites.resource';

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
