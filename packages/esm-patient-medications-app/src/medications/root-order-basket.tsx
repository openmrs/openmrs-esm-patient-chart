import React from 'react';
import OrderBasket from '../order-basket/order-basket.component';
import { Provider } from 'unistore/react';
import { orderBasketStore } from './order-basket-store';
import { DefaultWorkspaceProps } from '@openmrs/esm-patient-common-lib';

export default function RootOrderBasket({ patientUuid, closeWorkspace }: DefaultWorkspaceProps) {
  return (
    // @ts-ignore
    <Provider store={orderBasketStore}>
      <OrderBasket patientUuid={patientUuid} closeWorkspace={closeWorkspace} />
    </Provider>
  );
}
