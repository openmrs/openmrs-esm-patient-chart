import { describe, expect, it, vi } from 'vitest';
import { translateFrom } from '@openmrs/esm-framework';
import { getPriorityOptions } from './useOrders';

describe('getPriorityOptions', () => {
  it('translates the labels when called, not when the module loads', () => {
    const mockTranslateFrom = vi.mocked(translateFrom);
    const defaultTranslateFrom = mockTranslateFrom.getMockImplementation();
    mockTranslateFrom.mockImplementation((_moduleName, key) => `fr:${key}`);

    try {
      expect(getPriorityOptions()).toEqual([
        { value: 'ROUTINE', label: 'fr:Routine' },
        { value: 'STAT', label: 'fr:Stat' },
        { value: 'ON_SCHEDULED_DATE', label: 'fr:On scheduled date' },
      ]);
      expect(mockTranslateFrom).toHaveBeenCalledWith('@openmrs/esm-patient-chart-app', 'Routine');
    } finally {
      mockTranslateFrom.mockImplementation(defaultTranslateFrom);
    }
  });
});
