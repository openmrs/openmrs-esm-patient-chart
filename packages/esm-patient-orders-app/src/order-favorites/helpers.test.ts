import type { Drug } from '@openmrs/esm-patient-common-lib';
import type { DrugFavoriteOrder, DrugFavoriteAttributes, AttributeKey } from './types';
import { formatDrugInfo, buildFavoriteAttributes, buildFavoriteOrder } from './helpers';

beforeAll(() => {
  Object.defineProperty(globalThis, 'crypto', {
    value: { ...globalThis.crypto, randomUUID: jest.fn(() => 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee') },
  });
});

const makeFavorite = (overrides: Partial<DrugFavoriteOrder> = {}): DrugFavoriteOrder =>
  ({
    id: 'fav-1',
    drugUuid: 'drug-1',
    displayName: 'Aspirin 81mg',
    attributes: {},
    ...overrides,
  }) as DrugFavoriteOrder;

const makeDrug = (overrides: Partial<Drug> = {}): Drug =>
  ({
    uuid: 'drug-1',
    display: 'Aspirin 81mg',
    strength: '81mg',
    dosageForm: { display: 'Tablet', uuid: 'form-1' },
    concept: { uuid: 'concept-1', display: 'Aspirin' },
    ...overrides,
  }) as Drug;

describe('formatDrugInfo', () => {
  it('shows strength for drug-specific favorites', () => {
    const fav = makeFavorite({ attributes: { strength: '81mg' } });
    expect(formatDrugInfo(fav, 'Any strength')).toBe('81mg');
  });

  it('shows "Any strength" label for concept-based favorites', () => {
    const fav = makeFavorite({ drugUuid: undefined, conceptUuid: 'c-1', conceptName: 'Aspirin', attributes: {} });
    expect(formatDrugInfo(fav, 'Any strength')).toBe('Any strength');
  });

  it('joins dose, unit, route, frequency with dashes', () => {
    const fav = makeFavorite({
      attributes: { strength: '81mg', dose: '2', unit: 'Tablet', route: 'Oral', frequency: 'Once daily' },
    });
    expect(formatDrugInfo(fav, 'Any')).toBe('81mg — 2 Tablet — Oral — Once daily');
  });

  it('returns empty string when no attributes', () => {
    const fav = makeFavorite({ drugUuid: undefined, attributes: {} });
    expect(formatDrugInfo(fav, 'Any')).toBe('');
  });
});

describe('buildFavoriteAttributes', () => {
  const allSelected: Record<AttributeKey, boolean> = {
    strength: true,
    dose: true,
    unit: true,
    route: true,
    frequency: true,
  };

  const allValues: Record<AttributeKey, string> = {
    strength: '81mg',
    dose: '2',
    unit: 'Tablet',
    route: 'Oral',
    frequency: 'Once daily',
  };

  const uuids = { unitUuid: 'u-1', routeUuid: 'r-1', frequencyUuid: 'f-1' };

  it('includes all attributes for drug-specific favorites', () => {
    const result = buildFavoriteAttributes(allSelected, allValues, uuids, makeDrug(), true);
    expect(result.strength).toBe('81mg');
    expect(result.dose).toBe('2');
    expect(result.route).toBe('Oral');
    expect(result.frequency).toBe('Once daily');
    expect(result.routeUuid).toBe('r-1');
  });

  it('excludes dose, route, frequency for concept-based favorites', () => {
    const result = buildFavoriteAttributes(allSelected, allValues, uuids, undefined, false);
    expect(result.strength).toBe('81mg');
    expect(result.unit).toBe('Tablet');
    expect(result.dose).toBeUndefined();
    expect(result.route).toBeUndefined();
    expect(result.frequency).toBeUndefined();
  });

  it('stores dosageForm when drug is provided', () => {
    const result = buildFavoriteAttributes(allSelected, allValues, uuids, makeDrug(), true);
    expect(result.dosageFormDisplay).toBe('Tablet');
    expect(result.dosageFormUuid).toBe('form-1');
  });

  it('skips unselected attributes', () => {
    const noneSelected: Record<AttributeKey, boolean> = {
      strength: false,
      dose: false,
      unit: false,
      route: false,
      frequency: false,
    };
    const result = buildFavoriteAttributes(noneSelected, allValues, uuids, undefined, true);
    expect(result.strength).toBeUndefined();
    expect(result.dose).toBeUndefined();
  });
});

describe('buildFavoriteOrder', () => {
  const attrs: DrugFavoriteAttributes = { strength: '81mg' };

  it('builds a drug-specific favorite', () => {
    const result = buildFavoriteOrder(true, makeDrug(), 'Aspirin 81mg', attrs);
    expect(result.drugUuid).toBe('drug-1');
    expect(result.conceptUuid).toBe('concept-1');
    expect(result.displayName).toBe('Aspirin 81mg');
    expect(result.id).toBeDefined();
  });

  it('builds a concept-based favorite without a Drug object', () => {
    const result = buildFavoriteOrder(false, undefined, 'Aspirin (any)', attrs, 'concept-1', 'Aspirin');
    expect(result.drugUuid).toBeUndefined();
    expect(result.conceptUuid).toBe('concept-1');
    expect(result.conceptName).toBe('Aspirin');
  });

  it('throws when concept-based favorite has no conceptUuid', () => {
    expect(() => buildFavoriteOrder(false, undefined, 'Aspirin', attrs)).toThrow(
      'Cannot create concept-based favorite',
    );
  });
});
