/**
 * Order type constants to avoid magic strings throughout the application
 */

export const ORDER_TYPES = {
  DRUG_ORDER: 'drugorder',
  TEST_ORDER: 'testorder',
  GENERAL_ORDER: 'order',
} as const;

export type OrderTypeValue = (typeof ORDER_TYPES)[keyof typeof ORDER_TYPES];

/**
 * Order type grouping constants for the order basket
 */
export const ORDER_GROUPINGS = {
  MEDICATIONS: 'medications',
} as const;

/**
 * Order type display labels
 */
export const ORDER_TYPE_LABELS = {
  [ORDER_TYPES.DRUG_ORDER]: 'Drug orders',
  [ORDER_TYPES.TEST_ORDER]: 'Test orders',
  [ORDER_TYPES.GENERAL_ORDER]: 'General orders',
} as const;

/**
 * Check if an order type is a valid OMRS order type
 */
export const isValidOmrsOrderType = (orderType: string): boolean => {
  return Object.values(ORDER_TYPES).includes(orderType as OrderTypeValue);
};

/**
 * Get the appropriate grouping key for an order type
 */
export const getOrderGrouping = (orderType: OrderTypeValue, orderTypeUuid?: string): string => {
  switch (orderType) {
    case ORDER_TYPES.DRUG_ORDER:
      return ORDER_GROUPINGS.MEDICATIONS;
    case ORDER_TYPES.TEST_ORDER:
    case ORDER_TYPES.GENERAL_ORDER:
      return orderTypeUuid || 'general';
    default:
      return 'general';
  }
};
