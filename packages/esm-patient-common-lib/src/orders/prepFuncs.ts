import type { PostDataPrepFunction, OrderBasketItem, OrderPost } from './types';

export function prepOrderPostData(orderJavaClassName: string): PostDataPrepFunction {
  if (!orderJavaClassName) {
    return genericPostDataPrepFunction;
  }
  switch (orderJavaClassName) {
    case 'org.openmrs.Order':
      return genericPostDataPrepFunction;
  }
}

export const genericPostDataPrepFunction: PostDataPrepFunction = (order, patientUuid, encounterUuid) => {
  return {
    ...order,
    patient: patientUuid,
    encounter: encounterUuid,
  };
};
