import type { OrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { describe, it, expect } from 'vitest';
import { getEarliestStartDate } from './order-basket.utils';

const now = new Date('2026-05-06T12:00:00.000Z');

function makeOrderItem(
  overrides: Partial<OrderBasketItem & { scheduledDate?: Date | string; startDate?: Date | string }> = {},
): OrderBasketItem {
  return {
    action: 'NEW',
    display: 'Test order',
    ...overrides,
  } as OrderBasketItem;
}

describe('getEarliestStartDate', () => {
  it('returns the supplied "now" when no basket items have a selected start date', () => {
    const result = getEarliestStartDate([makeOrderItem(), makeOrderItem()], now);
    expect(result).toBe(now);
  });

  it('returns "now" when called with an empty basket', () => {
    expect(getEarliestStartDate([], now)).toBe(now);
  });

  it('returns the earliest scheduledDate among basket items', () => {
    const earlier = new Date('2026-05-04T08:00:00.000Z');
    const later = new Date('2026-05-05T08:00:00.000Z');
    const result = getEarliestStartDate(
      [makeOrderItem({ scheduledDate: later }), makeOrderItem({ scheduledDate: earlier })],
      now,
    );
    expect(result).toEqual(earlier);
  });

  it('parses string scheduledDates', () => {
    const earlier = '2026-05-03T00:00:00.000Z';
    const result = getEarliestStartDate([makeOrderItem({ scheduledDate: earlier })], now);
    expect(result.toISOString()).toEqual(new Date(earlier).toISOString());
  });

  it('ignores items without a selected start date when comparing', () => {
    const earlier = new Date('2026-05-04T08:00:00.000Z');
    const result = getEarliestStartDate(
      [makeOrderItem(), makeOrderItem({ scheduledDate: earlier }), makeOrderItem()],
      now,
    );
    expect(result).toEqual(earlier);
  });

  it('does not return a future scheduledDate when "now" is earlier', () => {
    const future = new Date('2026-05-10T08:00:00.000Z');
    const result = getEarliestStartDate([makeOrderItem({ scheduledDate: future })], now);
    expect(result).toBe(now);
  });

  it('keeps supporting legacy startDate basket items', () => {
    const earlier = new Date('2026-05-04T08:00:00.000Z');
    const result = getEarliestStartDate([makeOrderItem({ startDate: earlier })], now);
    expect(result).toEqual(earlier);
  });
});
