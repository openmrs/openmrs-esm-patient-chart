import type { OrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { vi, describe, it, expect } from 'vitest';
import { getEarliestStartDate } from './order-basket.utils';

const now = new Date('2026-05-06T12:00:00.000Z');

function makeOrderItem(overrides: Partial<OrderBasketItem & { startDate?: Date | string }> = {}): OrderBasketItem {
  return {
    action: 'NEW',
    display: 'Test order',
    ...overrides,
  } as OrderBasketItem;
}

describe('getEarliestStartDate', () => {
  it('returns the supplied "now" when no basket items have a startDate', () => {
    const result = getEarliestStartDate([makeOrderItem(), makeOrderItem()], now);
    expect(result).toBe(now);
  });

  it('returns "now" when called with an empty basket', () => {
    expect(getEarliestStartDate([], now)).toBe(now);
  });

  it('returns the earliest startDate among basket items', () => {
    const earlier = new Date('2026-05-04T08:00:00.000Z');
    const later = new Date('2026-05-05T08:00:00.000Z');
    const result = getEarliestStartDate(
      [makeOrderItem({ startDate: later }), makeOrderItem({ startDate: earlier })],
      now,
    );
    expect(result).toEqual(earlier);
  });

  it('parses string startDates', () => {
    const earlier = '2026-05-03T00:00:00.000Z';
    const result = getEarliestStartDate([makeOrderItem({ startDate: earlier })], now);
    expect(result.toISOString()).toEqual(new Date(earlier).toISOString());
  });

  it('ignores items without a startDate when comparing', () => {
    const earlier = new Date('2026-05-04T08:00:00.000Z');
    const result = getEarliestStartDate([makeOrderItem(), makeOrderItem({ startDate: earlier }), makeOrderItem()], now);
    expect(result).toEqual(earlier);
  });

  it('does not return a future startDate when "now" is earlier', () => {
    const future = new Date('2026-05-10T08:00:00.000Z');
    const result = getEarliestStartDate([makeOrderItem({ startDate: future })], now);
    expect(result).toBe(now);
  });
});
