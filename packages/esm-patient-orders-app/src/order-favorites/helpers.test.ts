import type { Drug } from '@openmrs/esm-patient-common-lib';
import { buildFavoriteOrder } from './helpers';

const makeDrug = (overrides: Partial<Drug> = {}): Drug =>
  ({
    uuid: 'drug-1',
    display: 'Aspirin 81mg',
    strength: '81mg',
    dosageForm: { display: 'Tablet', uuid: 'form-1' },
    concept: { uuid: 'concept-1', display: 'Aspirin' },
    ...overrides,
  }) as Drug;

describe('buildFavoriteOrder', () => {
  it('builds a favorite from a drug', () => {
    const result = buildFavoriteOrder(makeDrug());
    expect(result.drugUuid).toBe('drug-1');
    expect(result.conceptUuid).toBe('concept-1');
    expect(result.displayName).toBe('Aspirin 81mg');
    expect(result.attributes.strength).toBe('81mg');
    expect(result.attributes.dosageFormDisplay).toBe('Tablet');
    expect(result.attributes.dosageFormUuid).toBe('form-1');
    expect(result.id).toBeDefined();
  });
});
